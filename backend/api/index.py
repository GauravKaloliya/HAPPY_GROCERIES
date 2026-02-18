import os
import sys

# Add the project directory to the Python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# Set the Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "happy_groceries.settings")

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
