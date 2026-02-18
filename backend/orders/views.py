from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from .models import Order, OrderItem
from cart.models import Cart
from coupons.models import Coupon, UsedCoupon
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderListSerializer
)


def calculate_delivery_time(item_count, is_express=False):
    """Calculate estimated delivery time."""
    base_minutes = 30 if is_express else 45
    additional_minutes = (item_count // 500) * 5
    total_minutes = base_minutes + additional_minutes
    
    delivery_time = datetime.now() + timedelta(minutes=total_minutes)
    return {
        'minutes': total_minutes,
        'time_string': delivery_time.strftime('%I:%M %p'),
        'text': f"{'Express' if is_express else 'Standard'} delivery: {total_minutes} minutes (by {delivery_time.strftime('%I:%M %p')})"
    }


class OrderListView(generics.ListAPIView):
    """Get user's orders."""
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderCreateView(generics.CreateAPIView):
    """Create new order from cart."""
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get user's cart
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response({
                'success': False,
                'message': 'Cart is empty.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate totals
        subtotal = cart.total
        tax = subtotal * 0.08  # 8% tax
        
        # Delivery charge
        is_express = serializer.validated_data.get('delivery_type') == 'express'
        delivery_charge = 0 if subtotal >= 500 else (100 if is_express else 50)
        
        # Coupon discount
        coupon_discount = 0
        coupon_code = serializer.validated_data.get('coupon_code', '')
        
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code.upper(), active=True)
                if coupon.is_valid_for_user(request.user, subtotal, cart.items.all()):
                    coupon_discount = coupon.calculate_discount(subtotal, cart.items.all())
                    # Mark coupon as used
                    UsedCoupon.objects.create(user=request.user, coupon=coupon)
            except Coupon.DoesNotExist:
                pass
        
        total = subtotal + tax + delivery_charge - coupon_discount
        
        # Calculate delivery time
        item_count = cart.item_count
        delivery_info = calculate_delivery_time(item_count, is_express)
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            subtotal=subtotal,
            tax=tax,
            delivery_charge=delivery_charge,
            coupon_discount=coupon_discount,
            total=total,
            coupon_code=coupon_code,
            delivery_name=serializer.validated_data['delivery_name'],
            delivery_phone=serializer.validated_data['delivery_phone'],
            delivery_address=serializer.validated_data['delivery_address'],
            delivery_type=serializer.validated_data['delivery_type'],
            estimated_delivery=delivery_info['text']
        )
        
        # Create order items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price_at_time=cart_item.product.discounted_price
            )
        
        # Clear cart
        cart.clear()
        
        # Return order details
        order_serializer = OrderSerializer(order)
        
        return Response({
            'success': True,
            'message': 'Order placed successfully.',
            'order': order_serializer.data
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_order_stats(request):
    """Get user's order statistics."""
    orders = Order.objects.filter(user=request.user)
    
    total_orders = orders.count()
    total_spent = sum(order.total for order in orders)
    
    return Response({
        'success': True,
        'stats': {
            'total_orders': total_orders,
            'total_spent': round(total_spent, 2)
        }
    })
