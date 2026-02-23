from decimal import Decimal
from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Cart, CartItem
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer, UpdateCartItemSerializer
)


class CartViewSet(viewsets.ModelViewSet):
    """ViewSet for cart operations."""

    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).prefetch_related(
            'items__product__category'
        )

    def get_object(self):
        """Get or create cart for the authenticated user."""
        cart, created = Cart.objects.get_or_create(
            user=self.request.user,
            defaults={'is_deleted': False}
        )
        if not created and cart.is_deleted:
            cart.restore()
        return cart

    def list(self, request, *args, **kwargs):
        """Get the user's cart."""
        cart = self.get_object()
        serializer = self.get_serializer(cart)

        # Calculate tax (8%)
        subtotal = cart.subtotal
        tax = subtotal * Decimal('0.08')

        # Calculate delivery charge
        delivery = Decimal('0') if subtotal >= 500 else Decimal('50')

        # Return cart with calculated totals
        data = serializer.data
        data['tax'] = float(tax)
        data['delivery'] = float(delivery)
        data['total'] = float(subtotal + tax + delivery)

        return Response(data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        """Add item to cart."""
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = self.get_object()
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']

        from products.models import Product
        try:
            product = Product.objects.get(id=product_id, is_active=True, is_deleted=False)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check stock availability
        if product.stock < quantity:
            return Response(
                {'error': f'Only {product.stock} items available in stock'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the effective price at the time of adding
        price_at_add = product.effective_price

        cart_item = CartItem.objects.filter(cart=cart, product=product).first()
        if cart_item:
            if cart_item.is_deleted:
                cart_item.restore()
                cart_item.quantity = quantity
                cart_item.price_at_add_time = price_at_add
            else:
                new_quantity = cart_item.quantity + quantity
                if new_quantity > product.stock:
                    return Response(
                        {'error': f'Only {product.stock} items available in stock'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = new_quantity
                # Update price to current effective price
                cart_item.price_at_add_time = price_at_add
            cart_item.save()
        else:
            CartItem.objects.create(
                cart=cart, 
                product=product, 
                quantity=quantity,
                price_at_add_time=price_at_add
            )

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        """Update cart item quantity."""
        item_id = request.data.get('item_id') or request.data.get('product_id')
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quantity = serializer.validated_data['quantity']

        if not item_id:
            return Response(
                {'error': 'item_id and quantity are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_object()
        cart_item = CartItem.objects.filter(
            cart=cart,
            is_deleted=False
        ).filter(
            models.Q(id=item_id) | models.Q(product_id=item_id)
        ).first()

        if not cart_item:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if quantity == 0:
            cart_item.soft_delete()
        else:
            if quantity > cart_item.product.stock:
                return Response(
                    {'error': f'Only {cart_item.product.stock} items available in stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = quantity
            # Update price to current effective price
            cart_item.price_at_add_time = cart_item.product.effective_price
            cart_item.save()

        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Soft delete item from cart."""
        item_id = request.data.get('item_id') or request.data.get('product_id')

        if not item_id:
            return Response(
                {'error': 'item_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_object()
        cart_item = CartItem.objects.filter(
            cart=cart,
            is_deleted=False
        ).filter(
            models.Q(id=item_id) | models.Q(product_id=item_id)
        ).first()

        if not cart_item:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_item.soft_delete()
        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Soft delete all items from cart."""
        cart = self.get_object()
        cart.items.filter(is_deleted=False).update(
            is_deleted=True,
            deleted_at=models.functions.Now()
        )
        return Response(CartSerializer(cart).data)
