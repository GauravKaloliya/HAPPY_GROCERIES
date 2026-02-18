from django.urls import path
from .views import (
    CouponListView,
    validate_coupon,
    get_suggested_coupons,
    get_smart_recommendation
)

urlpatterns = [
    path('', CouponListView.as_view(), name='coupon-list'),
    path('validate/', validate_coupon, name='coupon-validate'),
    path('suggested/', get_suggested_coupons, name='coupon-suggested'),
    path('recommendation/', get_smart_recommendation, name='coupon-recommendation'),
]
