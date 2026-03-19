from decimal import Decimal
from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Cart, CartItem
from config.error_handling import BadRequestError, NotFoundError
from .serializers import (
    CartSerializer, AddToCartSerializer, UpdateCartItemSerializer
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
            'items__product__category',
            'items__variant'
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
        tax = subtotal * Decimal('0.08') if subtotal else Decimal('0')

        # Calculate delivery charge
        delivery = 0 if subtotal >= 500 else 50

        # Return cart with calculated totals
        data = serializer.data
        data['tax'] = float(tax)
        data['delivery'] = delivery
        data['total'] = float(subtotal + tax + delivery)

        return Response(data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        """Add item to cart."""
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = self.get_object()
        quantity = serializer.validated_data['quantity']
        product_id = serializer.validated_data.get('product_id')
        variant_id = serializer.validated_data.get('variant_id')

        from products.models import Product, ProductVariant
        try:
            product = Product.objects.get(id=product_id, is_active=True, is_deleted=False)
        except Product.DoesNotExist:
            raise NotFoundError('Product not found')

        variant = None
        if variant_id:
            variant = ProductVariant.objects.filter(
                id=variant_id,
                product_id=product.id,
                is_deleted=False,
            ).first()
            if not variant:
                raise NotFoundError('Variant not found for product')
        else:
            variant = product.default_variant

        # Check stock availability
        available_stock = variant.stock_quantity if variant else product.stock
        if available_stock < quantity:
            raise BadRequestError(f'Only {available_stock} items available in stock')

        cart_item = CartItem.objects.filter(cart=cart, product=product, variant=variant).first()
        if cart_item:
            if cart_item.is_deleted:
                cart_item.restore()
                cart_item.quantity = quantity
            else:
                new_quantity = cart_item.quantity + quantity
                if new_quantity > available_stock:
                    raise BadRequestError(f'Only {available_stock} items available in stock')
                cart_item.quantity = new_quantity
            cart_item.save()
        else:
            CartItem.objects.create(cart=cart, product=product, variant=variant, quantity=quantity)

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
            raise BadRequestError('item_id and quantity are required')

        cart = self.get_object()
        cart_item = CartItem.objects.filter(
            cart=cart,
            is_deleted=False
        ).filter(
            models.Q(id=item_id) | models.Q(product_id=item_id)
        ).first()

        if not cart_item:
            raise NotFoundError('Cart item not found')

        variant_id = serializer.validated_data.get('variant_id')

        if quantity == 0:
            cart_item.soft_delete()
        else:
            from products.models import ProductVariant
            if variant_id and (not cart_item.variant or cart_item.variant_id != variant_id):
                variant = ProductVariant.objects.filter(
                    id=variant_id,
                    product_id=cart_item.product_id,
                    is_deleted=False,
                ).first()
                if not variant:
                    raise BadRequestError('Variant not found for product')

                available_stock = variant.stock_quantity or 0
                if quantity > available_stock:
                    raise BadRequestError(f'Only {available_stock} items available in stock')

                existing = CartItem.objects.filter(
                    cart=cart,
                    product_id=cart_item.product_id,
                    variant=variant,
                    is_deleted=False,
                ).exclude(id=cart_item.id).first()
                if existing:
                    new_qty = min(existing.quantity + quantity, available_stock)
                    existing.quantity = new_qty
                    existing.save()
                    cart_item.soft_delete()
                else:
                    cart_item.variant = variant
                    cart_item.quantity = quantity
                    cart_item.save()
            else:
                available_stock = cart_item.variant.stock_quantity if cart_item.variant else cart_item.product.stock
                if quantity > available_stock:
                    raise BadRequestError(f'Only {available_stock} items available in stock')
                cart_item.quantity = quantity
                cart_item.save()

        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Soft delete item from cart."""
        item_id = request.data.get('item_id') or request.data.get('product_id')

        if not item_id:
            raise BadRequestError('item_id is required')

        cart = self.get_object()
        cart_item = CartItem.objects.filter(
            cart=cart,
            is_deleted=False
        ).filter(
            models.Q(id=item_id) | models.Q(product_id=item_id)
        ).first()

        if not cart_item:
            raise NotFoundError('Cart item not found')

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
