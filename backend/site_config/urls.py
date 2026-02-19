from django.urls import path
from . import views

urlpatterns = [
    path('settings/', views.get_site_settings, name='site-settings'),
    path('sort-options/', views.get_sort_options, name='sort-options'),
    path('all/', views.get_all_config, name='all-config'),
]
