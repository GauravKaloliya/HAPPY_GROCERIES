"""
Production settings for backend project.
"""

import os
from datetime import timedelta

from .base import *

# Force production mode
DEBUG = False

# Get allowed hosts from environment variable
render_host = os.environ.get('RENDER_EXTERNAL_HOSTNAME', '').strip()
default_hosts = ['localhost', '127.0.0.1', '.onrender.com']
if render_host:
    default_hosts.append(render_host)
ALLOWED_HOSTS = sorted(set(parse_csv_env('ALLOWED_HOSTS') + default_hosts))

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
CORS_ALLOWED_ORIGINS = parse_csv_env(
    'CORS_ALLOWED_ORIGINS',
    'https://happygroceries.shop,https://www.happygroceries.shop,http://localhost:5173,http://localhost:3000'
)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.onrender\.com$",
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = parse_csv_env('CSRF_TRUSTED_ORIGINS', 'https://*.onrender.com')

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
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'

# Frontend dist directory for SPA routing
frontend_dist_dir = BASE_DIR / 'frontend' / 'dist'
if frontend_dist_dir.exists():
    TEMPLATES[0]['DIRS'].append(frontend_dist_dir)

# Logging for production
LOGGING['handlers']['file']['level'] = 'WARNING'
LOGGING['loggers']['django']['level'] = 'WARNING'
