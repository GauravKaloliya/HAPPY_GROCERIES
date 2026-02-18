from django.urls import path
from .views import (
    WishlistView,
    add_to_wishlist,
    remove_from_wishlist,
    check_wishlist,
    toggle_wishlist
)

urlpatterns = [
    path('', WishlistView.as_view(), name='wishlist'),
    path('add/', add_to_wishlist, name='wishlist-add'),
    path('toggle/', toggle_wishlist, name='wishlist-toggle'),
    path('<int:product_id>/', remove_from_wishlist, name='wishlist-remove'),
    path('<int:product_id>/check/', check_wishlist, name='wishlist-check'),
]
