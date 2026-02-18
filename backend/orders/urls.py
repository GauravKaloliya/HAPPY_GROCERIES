from django.urls import path
from .views import (
    OrderListView,
    OrderDetailView,
    OrderCreateView,
    get_order_stats
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order-list'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('stats/', get_order_stats, name='order-stats'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
]
