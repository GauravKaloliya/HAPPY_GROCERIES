from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, RefreshTokenView,
    ProfileView, ChangePasswordView,
    CheckUsernameView, CheckEmailView, CheckPasswordView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('check-username/', CheckUsernameView.as_view(), name='check_username'),
    path('check-email/', CheckEmailView.as_view(), name='check_email'),
    path('check-password/', CheckPasswordView.as_view(), name='check_password'),
]
