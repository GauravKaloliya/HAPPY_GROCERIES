from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Prefetch, Q, F
from datetime import timedelta

from .models import Coupon, CouponUsage
from .serializers import (
    CouponSerializer, CouponValidationSerializer, ValidateCouponResponseSerializer
)


class CouponViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing available coupons."""
    
    permission_classes = [AllowAny]
    serializer_class = CouponSerializer
    
    def get_queryset(self):
        queryset = Coupon.objects.filter(is_active=True)
        
        # Filter valid coupons only
        now = timezone.now()
        queryset = queryset.filter(
            Q(valid_from__isnull=True) | Q(valid_from__lte=now)
        ).filter(
            Q(valid_until__isnull=True) | Q(valid_until__gte=now)
        )
        
        # Don't show expired usage limit
        queryset = queryset.exclude(
            Q(usage_limit__isnull=False) & Q(usage_count__gte=F('usage_limit'))
        )
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def validate(self, request):
        """Validate a coupon code against the user's cart."""
        serializer = CouponValidationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        code = serializer.validated_data['code'].upper()
        
        # Check if coupon exists and is valid
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Invalid coupon code',
                'coupon': None,
                'potential_discount': 0
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check coupon validity
        if not coupon.is_valid():
            message = 'This coupon is no longer active'
            
            # More specific error message
            if coupon.valid_until and timezone.now() > coupon.valid_until:
                message = 'This coupon has expired'
            elif coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
                message = 'This coupon has reached its usage limit'
            
            return Response({
                'valid': False,
                'message': message,
                'coupon': CouponSerializer(coupon).data,
                'potential_discount': 0
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # For authenticated users, check additional constraints
        if request.user.is_authenticated:
            # Check if user already used this coupon
            if CouponUsage.objects.filter(
                user=request.user,
                coupon=coupon
            ).exists():
                return Response({
                    'valid': False,
                    'message': 'This coupon has already been used',
                    'coupon': CouponSerializer(coupon).data,
                    'potential_discount': 0
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if first order only
            if coupon.first_order_only:
                # Check if user has any orders
                from orders.models import Order
                if Order.objects.filter(user=request.user).exists():
                    return Response({
                        'valid': False,
                        'message': 'This coupon is only valid for first-time customers',
                        'coupon': CouponSerializer(coupon).data,
                        'potential_discount': 0
                    }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate potential discount based on cart total
        cart_total = request.data.get('cart_total', 0)
        if cart_total:
            try:
                cart_total = float(cart_total)
            except (ValueError, TypeError):
                cart_total = 0
        
        # Check minimum order value
        if cart_total < float(coupon.min_order_value):
            shortfall = float(coupon.min_order_value) - cart_total
            return Response({
                'valid': False,
                'message': f'Minimum order value of ₹{coupon.min_order_value} required',
                'coupon': CouponSerializer(coupon).data,
                'potential_discount': 0,
                'shortfall': shortfall
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate potential discount
        potential_discount = self.calculate_discount_amount(coupon, cart_total)
        
        return Response({
            'valid': True,
            'message': 'Coupon is valid',
            'coupon': CouponSerializer(coupon).data,
            'potential_discount': potential_discount
        }, status=status.HTTP_200_OK)
    
    def calculate_discount_amount(self, coupon, cart_total):
        """Calculate discount amount based on coupon type and cart total."""
        discount_amount = 0
        
        if coupon.coupon_type == 'fixed':
            discount_amount = float(coupon.value)
        elif coupon.coupon_type == 'percentage':
            discount_amount = cart_total * (float(coupon.value) / 100)
        elif coupon.coupon_type == 'category':
            # This would need cart items to calculate accurately
            # For now, use a simplified calculation
            discount_amount = cart_total * (float(coupon.value) / 100)
        
        # Apply maximum discount cap
        if coupon.max_discount:
            max_discount = float(coupon.max_discount)
            discount_amount = min(discount_amount, max_discount)
        
        # Ensure discount doesn't exceed cart total
        return min(discount_amount, cart_total)
    
    @action(detail=False, methods=['get'])
    def user_coupons(self, request):
        """Get available coupons for authenticated user."""
        if not request.user.is_authenticated:
            return Response({
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get all valid coupons
        queryset = self.get_queryset()
        
        # Filter out coupons already used by the user
        used_coupon_ids = CouponUsage.objects.filter(
            user=request.user
        ).values_list('coupon_id', flat=True)
        
        queryset = queryset.exclude(id__in=used_coupon_ids)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)