from django.urls import path
from .views import (
    CategoryListView,
    CategoryProductsView,
    ProductListView,
    ProductDetailView,
    FeaturedProductsView,
    search_products
)

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'),
    path('featured/', FeaturedProductsView.as_view(), name='featured-products'),
    path('search/', search_products, name='product-search'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/products/', CategoryProductsView.as_view(), name='category-products'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
]
