from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProductComboViewSet

router = DefaultRouter()
router.register(r'', ProductComboViewSet, basename='product-combo')

urlpatterns = [
    path('', include(router.urls)),
]
