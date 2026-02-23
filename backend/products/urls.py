from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, BrandViewSet, ComboViewSet

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'combos', ComboViewSet, basename='combo')

urlpatterns = [
    path('', include(router.urls)),
]
