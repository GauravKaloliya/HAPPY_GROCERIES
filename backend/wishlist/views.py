from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Wishlist
from products.models import Product
from .serializers import WishlistSerializer, WishlistAddSerializer


class WishlistView(generics.RetrieveAPIView):
    """Get user's wishlist."""
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_wishlist(request):
    """Add product to wishlist."""
    serializer = WishlistAddSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    product_id = serializer.validated_data['product_id']
    product = get_object_or_404(Product, id=product_id, is_active=True)
    
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    wishlist.products.add(product)
    
    return Response({
        'success': True,
        'message': f'{product.name} added to wishlist.',
        'wishlist': WishlistSerializer(wishlist).data
    })


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_from_wishlist(request, product_id):
    """Remove product from wishlist."""
    wishlist = Wishlist.objects.filter(user=request.user).first()
    
    if not wishlist:
        return Response({
            'success': False,
            'message': 'Wishlist not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    product = get_object_or_404(Product, id=product_id)
    wishlist.products.remove(product)
    
    return Response({
        'success': True,
        'message': f'{product.name} removed from wishlist.',
        'wishlist': WishlistSerializer(wishlist).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_wishlist(request, product_id):
    """Check if product is in user's wishlist."""
    wishlist = Wishlist.objects.filter(user=request.user).first()
    is_wishlisted = False
    
    if wishlist:
        is_wishlisted = wishlist.products.filter(id=product_id).exists()
    
    return Response({
        'success': True,
        'is_wishlisted': is_wishlisted
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_wishlist(request):
    """Toggle product in wishlist."""
    product_id = request.data.get('product_id')
    
    if not product_id:
        return Response({
            'success': False,
            'message': 'Product ID is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    product = get_object_or_404(Product, id=product_id, is_active=True)
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    
    if wishlist.products.filter(id=product_id).exists():
        wishlist.products.remove(product)
        return Response({
            'success': True,
            'action': 'removed',
            'message': f'{product.name} removed from wishlist.',
            'wishlist': WishlistSerializer(wishlist).data
        })
    else:
        wishlist.products.add(product)
        return Response({
            'success': True,
            'action': 'added',
            'message': f'{product.name} added to wishlist.',
            'wishlist': WishlistSerializer(wishlist).data
        })
