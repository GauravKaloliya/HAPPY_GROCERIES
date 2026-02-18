from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

from .models import WishlistItem
from .serializers import WishlistItemSerializer, WishlistItemCreateSerializer
from products.models import Product


class WishlistViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user wishlist."""
    
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return wishlist items for the current user."""
        return WishlistItem.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).select_related('product', 'product__category')
    
    def create(self, request):
        """Add a product to the wishlist."""
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if product exists
        try:
            product = Product.objects.get(id=product_id, is_deleted=False)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already in wishlist
        wishlist_item, created = WishlistItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'is_deleted': False}
        )
        
        if not created and wishlist_item.is_deleted:
            # Restore soft-deleted item
            wishlist_item.restore()
            created = True
        
        if created:
            serializer = self.get_serializer(wishlist_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'error': 'Product already in wishlist'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, pk=None):
        """Remove a product from the wishlist (soft delete)."""
        try:
            # Try to find by product_id if pk is not a wishlist item id
            product_id = request.data.get('product_id') or pk
            
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
            return Response(
                {'error': 'Product not in wishlist'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Remove a product from the wishlist by product_id."""
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
            return Response(
                {'error': 'Product not in wishlist'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add a product to the wishlist."""
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id, is_deleted=False)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
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
        else:
            return Response(
                {'error': 'Product already in wishlist'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def check(self, request):
        """Check if a product is in the user's wishlist."""
        product_id = request.query_params.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        is_in_wishlist = WishlistItem.objects.filter(
            user=request.user,
            product_id=product_id,
            is_deleted=False
        ).exists()
        
        return Response({'is_in_wishlist': is_in_wishlist})
    
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
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        """Get the number of items in the wishlist."""
        count = WishlistItem.objects.filter(
            user=request.user,
            is_deleted=False
        ).count()
        
        return Response({'count': count})
