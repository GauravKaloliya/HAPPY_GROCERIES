"""
WSGI config for backend project.
"""

import os
from pathlib import Path
from django.core.wsgi import get_wsgi_application


def load_local_env():
    env_file = Path(__file__).resolve().parent.parent / '.env'
    if not env_file.exists():
        return

    for raw_line in env_file.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            os.environ.setdefault(key, value)


load_local_env()
environment = os.environ.get('ENVIRONMENT', 'development')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', f'config.settings.{environment}')

application = get_wsgi_application()
