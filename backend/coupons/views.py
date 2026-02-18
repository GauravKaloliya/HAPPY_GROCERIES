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
        queryset = Coupon.objects.filter(is_active=True, is_deleted=False)
        
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
            coupon = Coupon.objects.get(code=code, is_deleted=False)
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
            # Check if user already used this coupon (excluding soft-deleted)
            if CouponUsage.objects.filter(
                user=request.user,
                coupon=coupon,
                is_deleted=False
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
                if Order.objects.filter(user=request.user, is_deleted=False).exists():
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
        
        # Filter out coupons already used by the user (excluding soft-deleted)
        used_coupon_ids = CouponUsage.objects.filter(
            user=request.user,
            is_deleted=False
        ).values_list('coupon_id', flat=True)
        
        queryset = queryset.exclude(id__in=used_coupon_ids)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def soft_delete(self, request, pk=None):
        """Soft delete a coupon."""
        coupon = self.get_object()
        coupon.soft_delete()
        return Response({'message': 'Coupon soft deleted successfully'})
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore a soft-deleted coupon."""
        coupon = self.get_object()
        coupon.restore()
        return Response({'message': 'Coupon restored successfully'})
    
    @action(detail=True, methods=['patch'])
    def update_coupon(self, request, pk=None):
        """Update coupon details."""
        coupon = self.get_object()
        
        # Update allowed fields
        allowed_fields = ['description', 'value', 'min_order_value', 'max_discount', 
                        'usage_limit', 'is_active', 'valid_from', 'valid_until']
        
        for field in allowed_fields:
            if field in request.data:
                setattr(coupon, field, request.data[field])
        
        coupon.save()
        return Response(CouponSerializer(coupon).data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get coupon statistics."""
        stats = {
            'total_coupons': Coupon.objects.filter(is_deleted=False).count(),
            'active_coupons': Coupon.objects.filter(is_active=True, is_deleted=False).count(),
            'soft_deleted_coupons': Coupon.objects.filter(is_deleted=True).count(),
            'total_usages': CouponUsage.objects.filter(is_deleted=False).count(),
        }
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def all_coupons(self, request):
        """Get all coupons including soft-deleted."""
        include_deleted = request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        if include_deleted:
            queryset = Coupon.objects.all()
        else:
            queryset = self.get_queryset()
        
        serializer = CouponSerializer(queryset, many=True)
        return Response(serializer.data)