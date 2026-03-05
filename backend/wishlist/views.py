from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now

from .models import WishlistItem
from config.error_handling import BadRequestError, ConflictError, NotFoundError
from .serializers import WishlistItemSerializer
from products.models import Product


class WishlistViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user wishlist."""
    
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post']
    
    def get_queryset(self):
        """Return wishlist items for the current user."""
        return WishlistItem.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('product', 'product__category')
    
    @action(detail=False, methods=['post'])
    def add(self, request):
        """Add a product to the wishlist."""
        product_id = request.data.get('product_id')
        
        if not product_id:
            raise BadRequestError('product_id is required')
        
        try:
            product = Product.objects.get(id=product_id, is_deleted=False)
        except Product.DoesNotExist:
            raise NotFoundError('Product not found')
        
        wishlist_item, created = WishlistItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'is_deleted': False}
        )
        
        if not created and wishlist_item.is_deleted:
            wishlist_item.restore()
            created = True
        
        if created:
            serializer = self.get_serializer(wishlist_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        raise ConflictError('Product already in wishlist')
    
    @action(detail=True, methods=['get'], url_path='check')
    def check_item(self, request, pk=None):
        """Check if a product is in the user's wishlist."""
        product_id = pk
        
        is_in_wishlist = WishlistItem.objects.filter(
            user=request.user,
            product_id=product_id,
            is_deleted=False
        ).exists()
        
        return Response({'is_in_wishlist': is_in_wishlist})
    
    @action(detail=False, methods=['post'])
    def remove(self, request):
        """Remove a product from the wishlist by product_id."""
        product_id = request.data.get('product_id')
        
        if not product_id:
            raise BadRequestError('product_id is required')
        
        try:
            wishlist_item = WishlistItem.objects.get(
                user=request.user,
                product_id=product_id,
                is_deleted=False
            )
            wishlist_item.soft_delete()
            return Response(
                {'message': 'Product removed from wishlist'},
                status=status.HTTP_200_OK
            )
        except WishlistItem.DoesNotExist:
            raise NotFoundError('Product not in wishlist')
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear all items from the wishlist (soft delete)."""
        WishlistItem.objects.filter(
            user=request.user,
            is_deleted=False
        ).update(is_deleted=True, deleted_at=now())
        
        return Response(
            {'message': 'Wishlist cleared successfully'},
            status=status.HTTP_200_OK
        )
