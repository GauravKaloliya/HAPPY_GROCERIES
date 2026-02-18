from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from products.models import Product
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    CartItemCreateSerializer,
    CartItemUpdateSerializer
)


class CartView(generics.RetrieveAPIView):
    """Get user's cart."""
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart


class CartItemCreateView(generics.CreateAPIView):
    """Add item to cart."""
    serializer_class = CartItemCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        
        product = get_object_or_404(Product, id=product_id, is_active=True)
        
        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return cart_item
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return updated cart
        cart = Cart.objects.get(user=request.user)
        cart_serializer = CartSerializer(cart)
        
        return Response({
            'success': True,
            'message': 'Item added to cart.',
            'cart': cart_serializer.data
        }, status=status.HTTP_201_CREATED)


class CartItemUpdateView(generics.UpdateAPIView):
    """Update cart item quantity."""
    serializer_class = CartItemUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        cart = Cart.objects.filter(user=self.request.user).first()
        if cart:
            return CartItem.objects.filter(cart=cart)
        return CartItem.objects.none()


class CartItemDeleteView(generics.DestroyAPIView):
    """Remove item from cart."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        cart = Cart.objects.filter(user=self.request.user).first()
        if cart:
            return CartItem.objects.filter(cart=cart)
        return CartItem.objects.none()
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        
        # Return updated cart
        cart = Cart.objects.filter(user=request.user).first()
        if cart:
            cart_serializer = CartSerializer(cart)
            return Response({
                'success': True,
                'message': 'Item removed from cart.',
                'cart': cart_serializer.data
            })
        
        return Response({
            'success': True,
            'message': 'Item removed from cart.'
        })


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def clear_cart(request):
    """Clear all items from cart."""
    cart = Cart.objects.filter(user=request.user).first()
    if cart:
        cart.clear()
    
    return Response({
        'success': True,
        'message': 'Cart cleared.'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_cart(request):
    """Quick add to cart endpoint."""
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    
    if not product_id:
        return Response({
            'success': False,
            'message': 'Product ID is required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        quantity = int(quantity)
        if quantity < 1:
            quantity = 1
        if quantity > 99:
            quantity = 99
    except (ValueError, TypeError):
        quantity = 1
    
    product = get_object_or_404(Product, id=product_id, is_active=True)
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )
    
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    cart_serializer = CartSerializer(cart)
    
    return Response({
        'success': True,
        'message': f'{product.name} added to cart.',
        'cart': cart_serializer.data
    })
