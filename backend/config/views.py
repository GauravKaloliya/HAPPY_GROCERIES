"""
Views for the main config app.
"""
from django.shortcuts import render


def api_documentation(request):
    """
    Render the API documentation landing page.
    """
    return render(request, 'api_docs.html')
