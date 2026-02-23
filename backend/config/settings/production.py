"""
Production settings for backend project.
"""

from .base import *
import django

# Force production mode
DEBUG = False

# Get allowed hosts from environment variable
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Security settings for production
SECURE_SSL_REDIRECT = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

# HSTS settings
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Production CORS settings - use comma-separated string in environment variable
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'https://happygroceries.vercel.app,https://happygroceries-two.vercel.app,https://happygroceries.store,http://localhost:5173,http://localhost:3000'
).split(',')
CORS_ALLOW_CREDENTIALS = True

# Cookie settings for cross-domain JWT
SESSION_COOKIE_AGE = 1800  # 30 minutes
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'

# Production JWT settings (shorter access token)
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(minutes=15)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=7)
SIMPLE_JWT['ROTATE_REFRESH_TOKENS'] = True
SIMPLE_JWT['BLACKLIST_AFTER_ROTATION'] = True

# Email backend for production
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Security headers
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Static and media files
STATIC_URL = '/static/'
MEDIA_URL = '/media/'

# Logging for production
LOGGING['handlers']['file']['level'] = 'WARNING'
LOGGING['loggers']['django']['level'] = 'WARNING'
