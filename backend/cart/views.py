from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Cart, CartItem
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer, UpdateCartItemSerializer
)


def build_cart_response(cart):
    """Build cart response with calculated tax, delivery and total."""
    data = CartSerializer(cart).data
    subtotal = float(cart.subtotal)
    tax = round(subtotal * 0.08, 2)
    delivery = 0 if subtotal >= 500 else 40
    data['tax'] = tax
    data['delivery'] = delivery
    data['total'] = round(subtotal + tax + delivery, 2)
    return data


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
        cart, _ = Cart.objects.get_or_create(
            user=self.request.user,
            defaults={'is_deleted': False}
        )
        if cart.is_deleted:
            cart.is_deleted = False
            cart.deleted_at = None
            cart.save(update_fields=['is_deleted', 'deleted_at'])
        cart = Cart.objects.prefetch_related(
            'items__product__category'
        ).get(pk=cart.pk)
        return cart

    def list(self, request, *args, **kwargs):
        """Get the user's cart."""
        cart = self.get_object()
        return Response(build_cart_response(cart))

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

        if product.stock < quantity:
            return Response(
                {'error': f'Only {product.stock} items available in stock'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cart_item = CartItem.objects.get(cart=cart, product=product, is_deleted=False)
            new_quantity = cart_item.quantity + quantity
            if new_quantity > product.stock:
                return Response(
                    {'error': f'Only {product.stock} items available in stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = new_quantity
            cart_item.save()
        except CartItem.DoesNotExist:
            CartItem.objects.create(cart=cart, product=product, quantity=quantity)

        return Response(build_cart_response(cart), status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        """Update cart item quantity."""
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')

        if item_id is None or quantity is None:
            return Response(
                {'error': 'item_id and quantity are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cart = self.get_object()
            cart_item = CartItem.objects.get(id=item_id, cart=cart, is_deleted=False)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if int(quantity) == 0:
            cart_item.soft_delete()
        else:
            if int(quantity) > cart_item.product.stock:
                return Response(
                    {'error': f'Only {cart_item.product.stock} items available in stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = int(quantity)
            cart_item.save()

        return Response(build_cart_response(cart))

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Soft delete item from cart."""
        item_id = request.data.get('item_id')

        if not item_id:
            return Response(
                {'error': 'item_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cart = self.get_object()
            cart_item = CartItem.objects.get(id=item_id, cart=cart, is_deleted=False)
            cart_item.soft_delete()
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(build_cart_response(cart))

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Remove all items from cart."""
        cart = self.get_object()
        cart.items.filter(is_deleted=False).update(is_deleted=True)
        return Response(build_cart_response(cart))
