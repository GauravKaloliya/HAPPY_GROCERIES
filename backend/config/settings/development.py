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

# Use local Redis by default in development.
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CACHES['default']['LOCATION'] = REDIS_URL

# Development logging
LOGGING['loggers']['django']['level'] = 'DEBUG'

# Development-specific JWT settings
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(minutes=60)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=1)
