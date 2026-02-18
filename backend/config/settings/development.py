"""
Development settings for backend project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'happygroceriesapi.onrender.com']

# Development-specific CORS settings
CORS_ALLOW_ALL_ORIGINS = True

# Development database (can use SQLite for local dev)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Disable HTTPS requirements in development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Use local Redis if available, otherwise disable caching
try:
    import redis
    r = redis.from_url(REDIS_URL)
    r.ping()
except Exception:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }

# Development logging
LOGGING['loggers']['django']['level'] = 'DEBUG'

# Development-specific JWT settings
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(minutes=60)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=1)
