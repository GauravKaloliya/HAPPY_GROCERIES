"""
Order service for handling order creation and management.
"""
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import uuid

from orders.models import Order, OrderItem
from orders.services.pricing_service import PricingService
from cart.models import Cart
from coupons.models import Coupon, CouponUsage


class OrderService:
    """Service for handling order operations."""
    
    @classmethod
    @transaction.atomic
    def create_order(cls, user, cart, delivery_data):
        """Create an order from cart items."""
        
        delivery_type = delivery_data.get('delivery_type', 'standard')
        coupon_code = delivery_data.get('coupon_code')
        
        # Get cart items
        cart_items = cart.items.select_related('product__category').all()
        
        if not cart_items:
            raise ValueError("Cart is empty")
        
        # Calculate subtotal
        subtotal = sum(item.total for item in cart_items)
        
        # Calculate tax (8%)
        tax = PricingService.calculate_tax(subtotal)
        
        # Calculate delivery charge
        delivery_charge = PricingService.calculate_delivery(subtotal, delivery_type)
        
        # Validate and calculate coupon discount
        coupon_discount = 0
        coupon = None
        
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
                
                # Validate coupon
                if not coupon.is_valid():
                    raise ValueError("Coupon is not valid")
                
                if subtotal < coupon.min_order_value:
                    raise ValueError(f"Minimum order value of ₹{coupon.min_order_value} required")
                
                # Check if user already used this coupon
                if CouponUsage.objects.filter(user=user, coupon=coupon).exists():
                    raise ValueError("Coupon already used")
                
                # Check first order only
                if coupon.first_order_only and Order.objects.filter(user=user).exists():
                    raise ValueError("Coupon only valid for first order")
                
                # Calculate discount
                coupon_discount = PricingService.calculate_coupon_discount(
                    coupon, cart_items, subtotal
                )
                
            except Coupon.DoesNotExist:
                raise ValueError("Invalid coupon code")
        
        # Calculate total
        total = PricingService.calculate_total(subtotal, tax, delivery_charge, coupon_discount)
        
        # Generate order ID
        order_id = cls._generate_order_id()
        
        # Calculate delivery estimate
        delivery_minutes = PricingService.calculate_delivery_estimate(cart_items, delivery_type)
        estimated_delivery = timezone.now() + timedelta(minutes=delivery_minutes)
        
        # Create order
        order = Order.objects.create(
            user=user,
            order_id=order_id,
            status='confirmed',
            delivery_type=delivery_type,
            subtotal=subtotal,
            tax=tax,
            delivery_charge=delivery_charge,
            coupon_discount=coupon_discount,
            total=total,
            delivery_name=delivery_data.get('delivery_name'),
            delivery_phone=delivery_data.get('delivery_phone'),
            delivery_address=delivery_data.get('delivery_address'),
            delivery_instructions=delivery_data.get('delivery_instructions', ''),
            estimated_delivery=estimated_delivery,
        )
        
        # Create order items
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_price=cart_item.product.effective_price,
                product_emoji=cart_item.product.emoji,
                quantity=cart_item.quantity,
                discount_percent=cart_item.product.discount_percent,
                subtotal=cart_item.total,
            )
            
            # Reduce product stock
            product = cart_item.product
            product.stock = max(0, product.stock - cart_item.quantity)
            product.save()
        
        # Clear cart
        cart.items.all().delete()
        
        # Record coupon usage
        if coupon:
            CouponUsage.objects.create(
                user=user,
                coupon=coupon,
                order=order,
                discount_amount=coupon_discount,
            )
            
            # Update coupon usage count
            coupon.usage_count += 1
            coupon.save()
        
        # Update user's first_order flag
        if user.first_order:
            user.first_order = False
            user.save()
        
        return order
    
    @classmethod
    def _generate_order_id(cls):
        """Generate a unique order ID."""
        timestamp = timezone.now().strftime('%Y%m%d')
        unique_id = uuid.uuid4().hex[:6].upper()
        return f"ORD-{timestamp}-{unique_id}"
    
    @classmethod
    def get_order_statistics(cls, user):
        """Get order statistics for a user."""
        orders = Order.objects.filter(user=user)
        
        return {
            'total_orders': orders.count(),
            'total_spent': orders.aggregate(total=models.Sum('total'))['total'] or 0,
            'pending_orders': orders.filter(status__in=['pending', 'confirmed', 'processing']).count(),
            'delivered_orders': orders.filter(status='delivered').count(),
        }
    
    @classmethod
    def cancel_order(cls, order, user):
        """Cancel an order if possible."""
        if order.user != user:
            raise ValueError("Not authorized to cancel this order")
        
        if order.status in ['delivered', 'cancelled']:
            raise ValueError("Cannot cancel this order")
        
        # Restore product stock
        for item in order.items.all():
            product = item.product
            product.stock += item.quantity
            product.save()
        
        order.status = 'cancelled'
        order.save()
        
        return order