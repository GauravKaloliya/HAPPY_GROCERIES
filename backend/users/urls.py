from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, RefreshTokenView,
    ProfileView, ChangePasswordView, ActivityLogListView,
    ActivityLogCreateView, ActivityLogStatsView, ContactFormView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('activity-logs/', ActivityLogListView.as_view(), name='activity_logs'),
    path('activity-logs/create/', ActivityLogCreateView.as_view(), name='activity_logs_create'),
    path('activity-logs/stats/', ActivityLogStatsView.as_view(), name='activity_logs_stats'),
    path('contact/submit/', ContactFormView.as_view(), name='contact_submit'),
]