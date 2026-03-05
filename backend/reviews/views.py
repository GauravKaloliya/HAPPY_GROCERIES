from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404

from config.error_handling import BadRequestError, ForbiddenError
from .models import ProductReview, ReviewHelpful
from .serializers import (
    ProductReviewSerializer,
    CreateReviewSerializer
)
from orders.models import OrderItem
from products.models import Product


class ProductReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for product reviews."""

    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Get reviews for a specific product."""
        product_id = self.kwargs.get('product_id')
        if product_id:
            return ProductReview.objects.filter(
                product_id=product_id,
                is_approved=True,
                is_deleted=False
            )
        return ProductReview.objects.filter(
            user=self.request.user,
            is_deleted=False
        )
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateReviewSerializer
        return ProductReviewSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def create(self, request, product_id=None):
        """Create a review for a product."""
        # Check if product exists
        product = get_object_or_404(Product, id=product_id, is_deleted=False)

        # Find candidate order items containing this product.
        candidate_order_items = OrderItem.objects.filter(
            order__user=request.user,
            order__status__in=['delivered', 'confirmed'],
            product=product,
            order__is_deleted=False
        ).select_related('order').order_by('-order__created_at')

        if not candidate_order_items.exists():
            raise BadRequestError('You can review only products present in your orders.')

        # Use the latest order for which the user has not yet created a review.
        order_item = None
        for item in candidate_order_items:
            already_reviewed = ProductReview.objects.filter(
                user=request.user,
                product=product,
                order=item.order,
                is_deleted=False,
            ).exists()
            if not already_reviewed:
                order_item = item
                break

        if not order_item:
            raise BadRequestError('You have already reviewed this product for all eligible orders.')
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        review = ProductReview.objects.create(
            user=request.user,
            product=product,
            order=order_item.order,
            is_verified_purchase=True,
            **serializer.validated_data
        )
        
        # Update product rating
        self._update_product_rating(product)
        
        return Response(
            ProductReviewSerializer(review, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        """Update user's own review."""
        review = self.get_object()
        
        if review.user != request.user:
            raise ForbiddenError('You can only update your own reviews.')
        
        serializer = CreateReviewSerializer(review, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Update product rating
        self._update_product_rating(review.product)
        
        return Response(
            ProductReviewSerializer(review, context={'request': request}).data
        )
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete a review."""
        review = self.get_object()
        
        if review.user != request.user:
            raise ForbiddenError('You can only delete your own reviews.')
        
        review.soft_delete()
        
        # Update product rating
        self._update_product_rating(review.product)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def _update_product_rating(self, product):
        """Update product's average rating."""
        stats = ProductReview.objects.filter(
            product=product,
            is_approved=True,
            is_deleted=False
        ).aggregate(
            avg_rating=Avg('rating'),
            count=Count('id')
        )
        
        product.average_rating = stats['avg_rating'] or 0
        product.review_count = stats['count'] or 0
        product.save(update_fields=['average_rating', 'review_count'])
    
    @action(detail=True, methods=['post'])
    def helpful(self, request, pk=None):
        """Mark a review as helpful."""
        review = self.get_object()
        
        helpful_vote, created = ReviewHelpful.objects.get_or_create(
            review=review,
            user=request.user
        )
        
        if not created:
            # User already voted, remove their vote
            helpful_vote.delete()
            return Response(
                {'message': 'Helpful vote removed', 'helpful_count': review.helpful_votes.count()}
            )
        
        return Response(
            {'message': 'Review marked as helpful', 'helpful_count': review.helpful_votes.count()},
            status=status.HTTP_201_CREATED
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def product_review_summary(request, product_id):
    """Get review summary for a product."""
    product = get_object_or_404(Product, id=product_id, is_deleted=False)
    
    reviews = ProductReview.objects.filter(
        product=product,
        is_approved=True,
        is_deleted=False
    )
    
    # Calculate stats
    stats = reviews.aggregate(
        avg_rating=Avg('rating'),
        total=Count('id')
    )
    
    # Rating breakdown
    rating_breakdown = {}
    for rating in range(1, 6):
        count = reviews.filter(rating=rating).count()
        rating_breakdown[rating] = count
    
    # Check if current user can review
    can_review = False
    user_review = None
    
    if request.user.is_authenticated:
        purchased_order_items = OrderItem.objects.filter(
            order__user=request.user,
            order__status__in=['delivered', 'confirmed'],
            product=product,
            order__is_deleted=False,
        ).select_related('order')
        # User can review if at least one purchased order for this product
        # still has no review by this user.
        for item in purchased_order_items:
            has_review_for_order = ProductReview.objects.filter(
                user=request.user,
                product=product,
                order=item.order,
                is_deleted=False,
            ).exists()
            if not has_review_for_order:
                can_review = True
                break
        
        # Get user's review if exists
        user_review_obj = ProductReview.objects.filter(
            user=request.user,
            product=product,
            is_deleted=False
        ).first()
        
        if user_review_obj:
            user_review = ProductReviewSerializer(
                user_review_obj,
                context={'request': request}
            ).data
    
    data = {
        'average_rating': round(stats['avg_rating'] or 0, 1),
        'total_reviews': stats['total'] or 0,
        'rating_breakdown': rating_breakdown,
        'can_review': can_review,
        'user_review': user_review
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reviews(request):
    """Get all reviews by the current user."""
    reviews = ProductReview.objects.filter(
        user=request.user,
        is_deleted=False
    ).select_related('product').order_by('-created_at')
    
    serializer = ProductReviewSerializer(
        reviews,
        many=True,
        context={'request': request}
    )
    
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_reviews(request):
    """Get products that user can review (purchased but not reviewed)."""
    # Get all delivered products
    purchased_products = OrderItem.objects.filter(
        order__user=request.user,
        order__status__in=['delivered', 'confirmed'],
        order__is_deleted=False
    ).select_related('product').values_list('product', flat=True).distinct()
    
    # Get already reviewed products
    reviewed_products = ProductReview.objects.filter(
        user=request.user,
        is_deleted=False
    ).values_list('product_id', flat=True)
    
    # Get pending products
    pending_ids = set(purchased_products) - set(reviewed_products)
    
    from products.serializers import ProductListSerializer
    products = Product.objects.filter(id__in=pending_ids, is_deleted=False)
    
    serializer = ProductListSerializer(products, many=True)
    
    return Response(serializer.data)
