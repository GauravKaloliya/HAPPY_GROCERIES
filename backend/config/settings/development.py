"""
Development settings for backend project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'api.happygroceries.shop']

# Development-specific CORS settings
CORS_ALLOW_ALL_ORIGINS = True

# Disable HTTPS requirements in development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Redis configuration uses REDIS_URL from base settings.

# Development logging
LOGGING['loggers']['django']['level'] = 'DEBUG'

# Development-specific JWT settings
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(minutes=60)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=1)
