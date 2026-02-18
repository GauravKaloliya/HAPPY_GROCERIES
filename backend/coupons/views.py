from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from datetime import date
from .models import Coupon, UsedCoupon
from cart.models import Cart
from .serializers import (
    CouponSerializer,
    CouponValidationSerializer,
    CouponSuggestionSerializer
)


class CouponListView(generics.ListAPIView):
    """Get all active coupons."""
    serializer_class = CouponSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Coupon.objects.filter(active=True, expiry_date__gte=date.today())


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def validate_coupon(request):
    """Validate a coupon code for the current user's cart."""
    serializer = CouponValidationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    code = serializer.validated_data['code'].upper()
    
    try:
        coupon = Coupon.objects.get(code=code)
    except Coupon.DoesNotExist:
        return Response({
            'success': False,
            'valid': False,
            'message': 'Invalid coupon code.'
        })
    
    # Get user's cart
    cart = Cart.objects.filter(user=request.user).first()
    if not cart:
        return Response({
            'success': False,
            'valid': False,
            'message': 'Cart is empty.'
        })
    
    cart_total = cart.total
    cart_items = cart.items.all()
    
    # Check validity
    if not coupon.active or coupon.is_expired:
        return Response({
            'success': False,
            'valid': False,
            'message': 'This coupon is no longer active or has expired.'
        })
    
    if UsedCoupon.objects.filter(user=request.user, coupon=coupon).exists():
        return Response({
            'success': False,
            'valid': False,
            'message': 'This coupon has already been used.'
        })
    
    if cart_total < coupon.min_order_value:
        shortfall = coupon.min_order_value - cart_total
        return Response({
            'success': False,
            'valid': False,
            'message': f'Add ₹{shortfall:.0f} more to qualify for this offer.'
        })
    
    # Check category applicability
    if coupon.type == 'category':
        categories = coupon.get_applicable_categories()
        if categories:
            has_matching = any(
                item.product.category.name in categories
                for item in cart_items
            )
            if not has_matching:
                return Response({
                    'success': False,
                    'valid': False,
                    'message': f'This coupon is only valid for: {", ".join(categories)}'
                })
    
    # Check first order only
    if coupon.first_order_only:
        from orders.models import Order
        if Order.objects.filter(user=request.user).exists():
            return Response({
                'success': False,
                'valid': False,
                'message': 'This coupon is only valid for first-time customers.'
            })
    
    # Calculate discount
    discount = coupon.calculate_discount(cart_total, cart_items)
    
    return Response({
        'success': True,
        'valid': True,
        'coupon': CouponSerializer(coupon).data,
        'discount': discount,
        'message': 'Coupon is valid.'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_suggested_coupons(request):
    """Get smart coupon suggestions for user's cart."""
    cart = Cart.objects.filter(user=request.user).first()
    
    if not cart or not cart.items.exists():
        # Return all available coupons even if cart is empty
        coupons = Coupon.objects.filter(active=True, expiry_date__gte=date.today())
        suggestions = []
        for coupon in coupons:
            is_used = UsedCoupon.objects.filter(user=request.user, coupon=coupon).exists()
            days_until_expiry = (coupon.expiry_date - date.today()).days
            
            suggestions.append({
                'code': coupon.code,
                'description': coupon.description,
                'type': coupon.type,
                'value': coupon.value,
                'min_order_value': coupon.min_order_value,
                'max_discount': coupon.max_discount,
                'applicable_categories': coupon.get_applicable_categories(),
                'eligibility': 'not_applicable',
                'potential_discount': 0,
                'relevance_score': 0,
                'days_until_expiry': max(days_until_expiry, 0),
                'is_applied': False,
                'is_used': is_used,
                'eligibility_reason': 'Add items to cart to see eligible offers',
                'amount_needed': coupon.min_order_value,
                'percentage_to_go': 100
            })
        
        return Response({
            'success': True,
            'suggestions': suggestions
        })
    
    cart_total = cart.total
    cart_items = list(cart.items.all())
    applied_coupon_code = request.query_params.get('applied_coupon', '')
    
    coupons = Coupon.objects.filter(active=True, expiry_date__gte=date.today())
    suggestions = []
    
    for coupon in coupons:
        is_used = UsedCoupon.objects.filter(user=request.user, coupon=coupon).exists()
        is_applied = coupon.code == applied_coupon_code
        days_until_expiry = (coupon.expiry_date - date.today()).days
        
        # Calculate eligibility
        eligibility, reason, amount_needed, percentage_to_go = get_eligibility_info(
            coupon, request.user, cart_total, cart_items
        )
        
        # Calculate potential discount
        potential_discount = 0
        if eligibility == 'applicable':
            potential_discount = coupon.calculate_discount(cart_total, cart_items)
        
        # Calculate relevance score
        relevance_score = calculate_relevance_score(
            coupon, eligibility, potential_discount, cart_total, cart_items
        )
        
        suggestions.append({
            'code': coupon.code,
            'description': coupon.description,
            'type': coupon.type,
            'value': coupon.value,
            'min_order_value': coupon.min_order_value,
            'max_discount': coupon.max_discount,
            'applicable_categories': coupon.get_applicable_categories(),
            'eligibility': eligibility,
            'potential_discount': potential_discount,
            'relevance_score': relevance_score,
            'days_until_expiry': max(days_until_expiry, 0),
            'is_applied': is_applied,
            'is_used': is_used,
            'eligibility_reason': reason,
            'amount_needed': amount_needed,
            'percentage_to_go': percentage_to_go
        })
    
    # Sort by eligibility and relevance
    suggestions.sort(key=lambda x: (
        0 if x['eligibility'] == 'applicable' else (1 if x['eligibility'] == 'almost' else 2),
        -x['potential_discount'],
        -x['relevance_score']
    ))
    
    return Response({
        'success': True,
        'suggestions': suggestions
    })


def get_eligibility_info(coupon, user, cart_total, cart_items):
    """Get eligibility info for a coupon."""
    if not coupon.active or coupon.is_expired:
        return 'not_applicable', 'This coupon is no longer active', 0, 0
    
    if UsedCoupon.objects.filter(user=user, coupon=coupon).exists():
        return 'not_applicable', 'This coupon has already been used', 0, 0
    
    if coupon.first_order_only:
        from orders.models import Order
        if Order.objects.filter(user=user).exists():
            return 'not_applicable', 'This coupon is only valid for first-time customers', 0, 0
    
    shortfall = coupon.min_order_value - cart_total
    
    if shortfall > 0:
        percentage_to_go = (shortfall / coupon.min_order_value) * 100
        return (
            'almost' if shortfall <= 100 else 'not_applicable',
            f'Add ₹{shortfall:.0f} more to qualify',
            shortfall,
            percentage_to_go
        )
    
    # Check category applicability
    if coupon.type == 'category':
        categories = coupon.get_applicable_categories()
        if categories:
            has_matching = any(
                item.product.category.name in categories
                for item in cart_items
            )
            if not has_matching:
                return (
                    'not_applicable',
                    f'This coupon requires items from: {", ".join(categories)}',
                    0,
                    0
                )
    
    return 'applicable', 'Coupon is applicable', 0, 0


def calculate_relevance_score(coupon, eligibility, potential_discount, cart_total, cart_items):
    """Calculate relevance score for a coupon."""
    score = 50  # Base score
    
    # Higher score for applicable offers
    if eligibility == 'applicable':
        score += 30
    elif eligibility == 'almost':
        score += 15
    
    # Higher score for category matches
    if coupon.type == 'category':
        categories = coupon.get_applicable_categories()
        if categories:
            matching_items = [item for item in cart_items if item.product.category.name in categories]
            if matching_items:
                score += 20
                match_percentage = (len(matching_items) / len(cart_items)) * 100
                score += min(match_percentage, 20)
    
    # Higher score for higher discount amounts
    if cart_total > 0:
        discount_ratio = potential_discount / cart_total
        score += min(discount_ratio * 100, 25)
    
    # Lower score for soon-to-expire offers (urgency)
    days_until_expiry = (coupon.expiry_date - date.today()).days
    if days_until_expiry <= 7:
        score += 10
    
    return min(max(int(score), 0), 100)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_smart_recommendation(request):
    """Get top smart coupon recommendation."""
    response = get_suggested_coupons(request)
    suggestions = response.data.get('suggestions', [])
    
    if not suggestions:
        return Response({
            'success': True,
            'top_recommendation': None,
            'alternatives': [],
            'explanation': 'No offers available'
        })
    
    # Find applicable offers
    applicable = [s for s in suggestions if s['eligibility'] == 'applicable' and not s['is_applied']]
    
    if not applicable:
        best = suggestions[0] if suggestions else None
        return Response({
            'success': True,
            'top_recommendation': best,
            'alternatives': suggestions[1:3],
            'explanation': best['eligibility_reason'] if best else 'No offers available'
        })
    
    # Choose best applicable offer
    top = max(applicable, key=lambda x: x['potential_discount'] * 0.6 + x['relevance_score'] * 0.4)
    
    return Response({
        'success': True,
        'top_recommendation': top,
        'alternatives': [s for s in applicable if s != top][:2],
        'explanation': f"We recommend {top['code']} - you'll save ₹{top['potential_discount']:.0f} on this order!"
    })
