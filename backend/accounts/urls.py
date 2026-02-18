from django.urls import path
from .views import (
    RegisterView,
    me_view,
    update_profile_view,
    change_password_view,
    logout_view
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', me_view, name='me'),
    path('me/update/', update_profile_view, name='update-profile'),
    path('change-password/', change_password_view, name='change-password'),
    path('logout/', logout_view, name='logout'),
]
