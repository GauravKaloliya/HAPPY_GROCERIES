from django.urls import path
from .views import (
    CartView,
    CartItemCreateView,
    CartItemUpdateView,
    CartItemDeleteView,
    clear_cart,
    add_to_cart
)

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('items/', CartItemCreateView.as_view(), name='cart-item-create'),
    path('items/<int:pk>/', CartItemUpdateView.as_view(), name='cart-item-update'),
    path('items/<int:pk>/delete/', CartItemDeleteView.as_view(), name='cart-item-delete'),
    path('clear/', clear_cart, name='cart-clear'),
    path('add/', add_to_cart, name='cart-add'),
]
