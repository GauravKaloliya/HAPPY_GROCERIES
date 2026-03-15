from django.db import DatabaseError, models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Cart, CartItem
from config.error_handling import BadRequestError, NotFoundError, ServiceUnavailableError
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
        tax = subtotal * 0.08

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
        combo_id = serializer.validated_data.get('combo_id')
        product_id = serializer.validated_data.get('product_id')
        variant_id = serializer.validated_data.get('variant_id')

        if combo_id:
            summary = self._add_combo_items_to_cart(cart=cart, combo_id=combo_id, quantity=quantity)
            response_data = CartSerializer(cart).data
            response_data['combo_applied'] = summary
            return Response(response_data, status=status.HTTP_201_CREATED)

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

    def _add_combo_items_to_cart(self, cart, combo_id, quantity):
        """
        Cart schema stores products only; combo purchase in cart is represented by
        expanding combo items to their underlying products.
        """
        try:
            from product_combos.models import ProductCombo, ProductComboItem

            combo = ProductCombo.objects.filter(
                id=combo_id,
                is_active=True,
                is_deleted=False,
            ).first()
            if not combo:
                raise NotFoundError('Combo not found')

            combo_items = list(
                ProductComboItem.objects.filter(combo=combo, is_deleted=False).select_related('product', 'variant')
            )
            if not combo_items:
                raise BadRequestError('Combo has no active items')

            added_items = []
            for combo_item in combo_items:
                total_qty = combo_item.quantity * quantity
                variant_stock = combo_item.variant.stock_quantity or 0
                default_variant = combo_item.product.default_variant
                if not default_variant or default_variant.id != combo_item.variant_id:
                    raise BadRequestError(
                        f'Combo item "{combo_item.product.name}" uses a non-default variant and cannot be added to cart'
                    )
                if total_qty > variant_stock:
                    raise BadRequestError(
                        f'Combo item "{combo_item.product.name}" has only {variant_stock} in stock'
                    )

                cart_item = CartItem.objects.filter(
                    cart=cart,
                    product=combo_item.product,
                    variant=combo_item.variant,
                ).first()
                if cart_item:
                    if cart_item.is_deleted:
                        cart_item.restore()
                        cart_item.quantity = total_qty
                    else:
                        new_quantity = cart_item.quantity + total_qty
                        if new_quantity > variant_stock:
                            raise BadRequestError(
                                f'Only {variant_stock} items available for "{combo_item.product.name}"'
                            )
                        cart_item.quantity = new_quantity
                    cart_item.save()
                else:
                    CartItem.objects.create(
                        cart=cart,
                        product=combo_item.product,
                        variant=combo_item.variant,
                        quantity=total_qty,
                    )

                added_items.append(
                    {
                        'product_id': combo_item.product_id,
                        'product_name': combo_item.product.name,
                        'quantity_added': total_qty,
                    }
                )

            return {
                'combo_id': combo.id,
                'combo_name': combo.name,
                'combo_quantity': quantity,
                'mode': 'expanded_to_products',
                'items': added_items,
            }
        except DatabaseError as exc:
            raise ServiceUnavailableError(
                'Combo functionality is unavailable because required schema objects are missing',
                code='schema_mismatch',
            ) from exc

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
