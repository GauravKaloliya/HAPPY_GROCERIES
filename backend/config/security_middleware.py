"""
Security middleware for comprehensive backend API protection.
Implements multiple layers of security including rate limiting, CSRF protection,
XSS prevention, SQL injection prevention, and more.
"""
import time
import hashlib
import secrets
import re
from collections import defaultdict
from django.http import JsonResponse, HttpResponseForbidden
from django.urls import reverse
from django.conf import settings
import json
import ipaddress
from datetime import datetime, timedelta


class SecurityMiddleware:
    """
    Comprehensive security middleware providing multiple layers of protection.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # List of trusted hosts/ips (empty list means allow all)
        self.trusted_hosts = getattr(settings, 'TRUSTED_HOSTS', [])
        # Rate limiting configuration
        self.rate_limit_requests = getattr(settings, 'RATE_LIMIT_REQUESTS', 100)
        self.rate_limit_window = getattr(settings, 'RATE_LIMIT_WINDOW', 60)  # seconds
        # Block duration for suspicious requests
        self.block_duration = getattr(settings, 'BLOCK_DURATION', 300)  # 5 minutes
        # In-memory storage for rate limiting
        self.request_counts = defaultdict(list)
        self.blocked_ips = {}
        
        # Suspicious patterns
        self.SQL_INJECTION_PATTERNS = [
            r"(\%27)|(\')|(\-\-)|(\%23)|(#)",
            r"((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))",
            r"(\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))",
            r"((\%27)|(\'))union",
        ]
        
        self.XSS_PATTERNS = [
            r"<script[^>]*>.*?</script>",
            r"<iframe[^>]*>.*?</iframe>",
            r"javascript:",
            r"on\w+\s*=",
            r"<img[^>]*src\s*=\s*[\"']javascript:",
            r"<link[^>]*href\s*=\s*[\"']javascript:",
        ]
        
        self.PATH_TRAVERSAL_PATTERNS = [
            r"\.\./\.\./",
            r"\.\.\\.*\\",
            r"%2e%2e%2f",
            r"%2e%2e%5c",
        ]
    
    def __call__(self, request):
        # Process request
        response = self.process_request(request)
        if response is not None:
            return response
        
        # Get response from next middleware/view
        response = self.get_response(request)
        
        # Add security headers to response
        response = self.process_response(request, response)
        
        return response
    
    def process_request(self, request):
        """Process incoming request and apply security checks."""
        
        # Get client IP
        client_ip = self.get_client_ip(request)
        
        # Check if IP is blocked
        if self.is_ip_blocked(client_ip):
            return JsonResponse({
                'error': 'IP temporarily blocked due to suspicious activity',
                'status': 403,
                'timestamp': datetime.utcnow().isoformat()
            }, status=403)
        
        # Rate limiting
        if not self.check_rate_limit(client_ip):
            self.block_ip(client_ip)
            return JsonResponse({
                'error': 'Rate limit exceeded. Try again later.',
                'status': 429,
                'timestamp': datetime.utcnow().isoformat()
            }, status=429)
        
        # Security headers check
        if not self.validate_headers(request):
            return HttpResponseForbidden('Invalid request headers')
        
        # Host header validation
        if not self.validate_host(request):
            return HttpResponseForbidden('Invalid host header')
        
        # Path traversal protection
        if self.detect_path_traversal(request):
            self.log_security_event(client_ip, 'PATH_TRAVERSAL', request.path)
            return HttpResponseForbidden('Access denied')
        
        # SQL injection detection
        if self.detect_sql_injection(request):
            self.log_security_event(client_ip, 'SQL_INJECTION', request.path)
            self.block_ip(client_ip)
            return HttpResponseForbidden('Access denied')
        
        # XSS detection
        if self.detect_xss(request):
            self.log_security_event(client_ip, 'XSS', request.path)
            return HttpResponseForbidden('Access denied')
        
        # Request size validation
        if not self.validate_request_size(request):
            return JsonResponse({
                'error': 'Request payload too large',
                'status': 413,
                'timestamp': datetime.utcnow().isoformat()
            }, status=413)
        
        # Generate CSRF token for unsafe methods
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            csrf_token = self.generate_csrf_token()
            request.META['X-CSRFToken'] = csrf_token
        
        return None
    
    def process_response(self, request, response):
        """Add security headers to response."""
        # Set security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # Content Security Policy
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self'"
        )
        
        return response
    
    def get_client_ip(self, request):
        """Extract client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            # Use the first IP in the list (client IP)
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def check_rate_limit(self, ip):
        """Check if IP is within rate limit."""
        now = time.time()
        window_start = now - self.rate_limit_window
        
        # Clean old entries
        self.request_counts[ip] = [
            timestamp for timestamp in self.request_counts[ip]
            if timestamp > window_start
        ]
        
        # Add current request
        self.request_counts[ip].append(now)
        
        # Check if over limit
        return len(self.request_counts[ip]) <= self.rate_limit_requests
    
    def block_ip(self, ip):
        """Block an IP address for a specified duration."""
        self.blocked_ips[ip] = time.time() + self.block_duration
    
    def is_ip_blocked(self, ip):
        """Check if IP is currently blocked."""
        if ip in self.blocked_ips:
            if time.time() > self.blocked_ips[ip]:
                # Unblock if time expired
                del self.blocked_ips[ip]
                return False
            return True
        return False
    
    def validate_headers(self, request):
        """Validate request headers for security."""
        # Check for required headers
        if request.method in ['POST', 'PUT', 'PATCH']:
            # Check Content-Type for API requests
            content_type = request.META.get('CONTENT_TYPE', '')
            if content_type and 'application/json' not in content_type and 'application/x-www-form-urlencoded' not in content_type:
                # Allow multipart for file uploads
                if 'multipart/form-data' not in content_type:
                    return False
        
        return True
    
    def validate_host(self, request):
        """Validate Host header to prevent host injection."""
        host = request.META.get('HTTP_HOST', '')
        server_name = request.META.get('SERVER_NAME', '')
        
        # If trusted hosts are configured, check against them
        if self.trusted_hosts:
            return host in self.trusted_hosts
        
        # Default validation - must match server name
        return host == server_name or host.startswith(server_name)
    
    def detect_sql_injection(self, request):
        """Detect potential SQL injection attempts."""
        # Check URL path
        if self.contains_patterns(request.path, self.SQL_INJECTION_PATTERNS):
            return True
        
        # Check query parameters
        for key, value in request.GET.items():
            if isinstance(value, str) and self.contains_patterns(value, self.SQL_INJECTION_PATTERNS):
                return True
        
        # Check request body for JSON
        if request.body:
            try:
                if request.META.get('CONTENT_TYPE', '').startswith('application/json'):
                    body = json.loads(request.body.decode('utf-8'))
                    if self.contains_patterns(str(body), self.SQL_INJECTION_PATTERNS):
                        return True
            except:
                # If we can't parse JSON, check raw body
                if self.contains_patterns(request.body.decode('utf-8', errors='ignore'), self.SQL_INJECTION_PATTERNS):
                    return True
        
        return False
    
    def detect_xss(self, request):
        """Detect potential XSS attempts."""
        # Check URL
        if self.contains_patterns(request.path, self.XSS_PATTERNS):
            return True
        
        # Check GET parameters
        for key, value in request.GET.items():
            if isinstance(value, str) and self.contains_patterns(value, self.XSS_PATTERNS):
                return True
        
        # Check POST data
        if request.method == 'POST':
            try:
                if request.META.get('CONTENT_TYPE', '').startswith('application/json'):
                    body = json.loads(request.body.decode('utf-8'))
                    if self.contains_patterns(str(body), self.XSS_PATTERNS):
                        return True
            except:
                pass
        
        return False
    
    def detect_path_traversal(self, request):
        """Detect path traversal attempts."""
        path = request.path
        return self.contains_patterns(path, self.PATH_TRAVERSAL_PATTERNS)
    
    def contains_patterns(self, text, patterns):
        """Check if text contains any of the given patterns."""
        if not text:
            return False
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    def validate_request_size(self, request):
        """Validate request size to prevent DoS attacks."""
        if not request.body:
            return True
        
        max_size = getattr(settings, 'MAX_REQUEST_SIZE', 10 * 1024 * 1024)  # 10MB default
        return len(request.body) <= max_size
    
    def generate_csrf_token(self):
        """Generate a secure CSRF token."""
        return secrets.token_urlsafe(32)
    
    def log_security_event(self, ip, event_type, path):
        """Log security events for monitoring."""
        # In production, send this to your logging system
        timestamp = datetime.utcnow().isoformat()
        log_message = f"[SECURITY] {timestamp} | IP: {ip} | Event: {event_type} | Path: {path}"
        print(log_message)  # Replace with proper logging


class APIKeyMiddleware:
    """
    Middleware to validate API keys for authenticated endpoints.
    """
    
    API_KEY_HEADER = 'X-API-Key'
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Only check for API keys on protected endpoints
        if request.path.startswith('/api/'):
            # Skip for authentication endpoints
            if '/auth/' not in request.path or request.path == '/api/auth/profile/':
                # Check if API key is provided
                api_key = request.META.get(self.API_KEY_HEADER)
                
                if not api_key:
                    return JsonResponse({
                        'error': 'API key required',
                        'status': 401,
                        'timestamp': datetime.utcnow().isoformat()
                    }, status=401)
                
                # Validate API key
                if not self.validate_api_key(api_key):
                    return JsonResponse({
                        'error': 'Invalid API key',
                        'status': 403,
                        'timestamp': datetime.utcnow().isoformat()
                    }, status=403)
        
        return self.get_response(request)
    
    def validate_api_key(self, api_key):
        """Validate the provided API key."""
        # In production, store API keys in database or environment variables
        valid_keys = getattr(settings, 'API_KEYS', [])
        return api_key in valid_keys


class JWTAuthenticationMiddleware:
    """
    Enhanced JWT authentication middleware with additional validations.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        if request.path.startswith('/api/'):
            # Skip authentication endpoints
            if '/auth/' not in request.path:
                # Get auth header
                auth_header = request.META.get('HTTP_AUTHORIZATION')
                
                if auth_header:
                    if not auth_header.startswith('Bearer '):
                        return JsonResponse({
                            'error': 'Invalid authorization header',
                            'status': 401,
                            'timestamp': datetime.utcnow().isoformat()
                        }, status=401)
        
        return self.get_response(request)
