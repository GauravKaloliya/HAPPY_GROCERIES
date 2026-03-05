"""
Order service for handling order creation and management.
"""
from decimal import Decimal
from django.db import DatabaseError, models, transaction
from django.utils import timezone
from datetime import timedelta
import random

from orders.models import Order, OrderItem
from orders.services.pricing_service import PricingService
from coupons.models import Coupon, CouponUsage
from config.error_handling import ServiceUnavailableError


class OrderLineItem:
    def __init__(self, product=None, quantity=1, total=Decimal('0'), unit_price=Decimal('0'), combo=None):
        self.product = product
        self.quantity = quantity
        self.total = Decimal(str(total))
        self.unit_price = Decimal(str(unit_price))
        self.combo = combo

    @property
    def is_combo(self):
        return self.combo is not None


class OrderService:
    """Service for handling order operations."""
    
    @classmethod
    @transaction.atomic
    def create_order(cls, user, cart, delivery_data):
        """Create an order from cart items or provided items."""
        
        delivery_type = delivery_data.get('delivery_type', 'standard')
        coupon_code = delivery_data.get('coupon_code')
        
        # Get items - either from cart or from provided data
        if cart:
            cart_items = cart.items.select_related('product__category').filter(is_deleted=False)
            if not cart_items.exists():
                raise ValueError("Cart is empty")
        else:
            items_data = delivery_data.get('items', [])
            if not items_data:
                raise ValueError("No items provided")
            cart_items = cls._build_line_items(items_data)
        
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
            if getattr(cart_item, 'is_combo', False):
                combo = cart_item.combo
                combo_total_mrp = Decimal('0')
                for combo_item in combo.items.filter(is_deleted=False).select_related('variant'):
                    unit_price = combo_item.override_price if combo_item.override_price is not None else combo_item.variant.price
                    combo_total_mrp += unit_price * combo_item.quantity * cart_item.quantity

                    variant = combo_item.variant
                    variant.stock_quantity = max(0, variant.stock_quantity - (combo_item.quantity * cart_item.quantity))
                    variant.save(update_fields=['stock_quantity', 'updated_at'])

                discount_percent = 0
                if combo_total_mrp > 0 and cart_item.total < combo_total_mrp:
                    discount_percent = int(((combo_total_mrp - cart_item.total) / combo_total_mrp) * 100)

                OrderItem.objects.create(
                    order=order,
                    product=None,
                    product_name=combo.name,
                    product_price=cart_item.unit_price,
                    product_emoji='📦',
                    quantity=cart_item.quantity,
                    discount_percent=discount_percent,
                    subtotal=cart_item.total,
                )
            else:
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

                product = cart_item.product
                variant = product.default_variant
                if variant:
                    variant.stock_quantity = max(0, variant.stock_quantity - cart_item.quantity)
                    variant.save(update_fields=['stock_quantity', 'updated_at'])
        
        # Clear cart if it was provided
        if cart:
            cart.items.filter(is_deleted=False).update(
                is_deleted=True,
                deleted_at=timezone.now()
            )
        
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
    def _build_line_items(cls, items_data):
        from product_combos.models import ProductCombo
        from products.models import Product

        line_items = []
        for item_data in items_data:
            quantity = int(item_data.get('quantity', 1))
            if quantity < 1:
                raise ValueError("Quantity must be at least 1")

            combo_id = item_data.get('combo_id')
            if combo_id is not None:
                try:
                    combo = ProductCombo.objects.prefetch_related('items__variant').get(
                        id=combo_id,
                        is_active=True,
                        is_deleted=False,
                    )
                except ProductCombo.DoesNotExist:
                    raise ValueError("Combo not found")
                except DatabaseError as exc:
                    raise ServiceUnavailableError(
                        'Combo functionality is unavailable because required schema objects are missing',
                        code='schema_mismatch',
                    ) from exc

                combo_items = [ci for ci in combo.items.all() if not ci.is_deleted]
                if not combo_items:
                    raise ValueError("Combo has no active items")

                for combo_item in combo_items:
                    required = combo_item.quantity * quantity
                    stock = combo_item.variant.stock_quantity or 0
                    if stock < required:
                        raise ValueError(
                            f'Combo item "{combo_item.product.name}" has only {stock} in stock'
                        )

                unit_price = Decimal(str(combo.price))
                line_items.append(
                    OrderLineItem(
                        product=None,
                        quantity=quantity,
                        unit_price=unit_price,
                        total=unit_price * quantity,
                        combo=combo,
                    )
                )
                continue

            try:
                product = Product.objects.get(
                    id=item_data['product_id'],
                    is_active=True,
                    is_deleted=False,
                )
            except KeyError:
                raise ValueError("product_id is required for non-combo items")
            except Product.DoesNotExist:
                raise ValueError("Product not found")

            if product.stock < quantity:
                raise ValueError(f'Only {product.stock} items available for "{product.name}"')

            unit_price = Decimal(str(item_data.get('price', product.effective_price)))
            line_items.append(
                OrderLineItem(
                    product=product,
                    quantity=quantity,
                    unit_price=unit_price,
                    total=unit_price * quantity,
                )
            )

        return line_items
    
    @classmethod
    def _generate_order_id(cls):
        """
        Generate a unique order ID matching schema constraint:
        ^HG[0-9]{8}$
        """
        for _ in range(25):
            candidate = f"HG{random.randint(0, 99999999):08d}"
            if not Order.objects.filter(order_id=candidate).exists():
                return candidate
        raise ValueError("Failed to generate unique order ID")
    
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
        
        # Restore stock on the actual sellable variant (new schema).
        for item in order.items.all():
            product = item.product
            if not product:
                continue
            variant = product.default_variant
            if variant:
                variant.stock_quantity += item.quantity
                variant.save(update_fields=['stock_quantity', 'updated_at'])
        
        order.status = 'cancelled'
        order.save()
        
        return order
