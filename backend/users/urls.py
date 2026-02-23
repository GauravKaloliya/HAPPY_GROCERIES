from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, RefreshTokenView,
    ProfileView, ChangePasswordView, check_phone_exists, check_email_exists, check_username_exists
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('check-phone/', check_phone_exists, name='check_phone'),
    path('check-email/', check_email_exists, name='check_email'),
    path('check-username/', check_username_exists, name='check_username'),
]
