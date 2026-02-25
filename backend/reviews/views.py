from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404

from .models import ProductReview, ReviewHelpful
from .serializers import (
    ProductReviewSerializer,
    CreateReviewSerializer,
    ReviewSummarySerializer
)
from orders.models import Order, OrderItem
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
        
        # Check if user already reviewed this product from any order
        existing_review = ProductReview.objects.filter(
            user=request.user,
            product=product,
            is_deleted=False
        ).first()
        
        if existing_review:
            return Response(
                {'error': 'You have already reviewed this product.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the order that contained this product if available
        order_item = OrderItem.objects.filter(
            order__user=request.user,
            order__status__in=['delivered', 'confirmed'],
            product=product,
            order__is_deleted=False
        ).select_related('order').first()
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        review = ProductReview.objects.create(
            user=request.user,
            product=product,
            order=order_item.order if order_item else None,
            is_verified_purchase=order_item is not None,
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
            return Response(
                {'error': 'You can only update your own reviews.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
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
            return Response(
                {'error': 'You can only delete your own reviews.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
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
        
        product.rating = stats['avg_rating'] or 0
        product.reviews_count = stats['count'] or 0
        product.save(update_fields=['rating', 'reviews_count'])
    
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
        # Check if user already reviewed
        has_reviewed = ProductReview.objects.filter(
            user=request.user,
            product=product,
            is_deleted=False
        ).exists()
        
        # Allow any authenticated user to review (not just purchasers)
        can_review = not has_reviewed
        
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
