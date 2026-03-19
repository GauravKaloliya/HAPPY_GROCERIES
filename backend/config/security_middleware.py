"""
High-security middleware for API traffic.
"""

from __future__ import annotations

import logging
import re
from typing import Iterable

from django.conf import settings
from django.core.cache.backends.base import InvalidCacheBackendError
from django.core.cache import cache
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils import timezone
from redis.exceptions import RedisError

logger = logging.getLogger(__name__)


class SecurityMiddleware:
    """Defense-in-depth middleware for production APIs."""

    DEFAULT_MAX_REQUEST_SIZE = 1 * 1024 * 1024  # 1 MB
    DEFAULT_RATE_LIMIT = 120
    DEFAULT_RATE_WINDOW = 60
    DEFAULT_AUTH_RATE_LIMIT = 20

    BLOCKED_UA_SUBSTRINGS = (
        "sqlmap",
        "nikto",
        "acunetix",
        "nmap",
        "masscan",
        "fuzz",
        "crawler",
    )

    ATTACK_PATTERNS = (
        re.compile(r"(<script\b|javascript:|onerror\s*=|onload\s*=)", re.IGNORECASE),
        re.compile(r"(\.\./|\.\.\\|%2e%2e%2f|%2e%2e%5c)", re.IGNORECASE),
        re.compile(r"(union\s+select|drop\s+table|insert\s+into|--\s|/\*|\*/)", re.IGNORECASE),
        re.compile(r"(sleep\(|benchmark\(|pg_sleep\()", re.IGNORECASE),
    )

    def __init__(self, get_response):
        self.get_response = get_response
        self.max_request_size = int(
            getattr(settings, "MAX_REQUEST_SIZE", self.DEFAULT_MAX_REQUEST_SIZE)
        )
        self.rate_limit = int(
            getattr(settings, "RATE_LIMIT_REQUESTS", self.DEFAULT_RATE_LIMIT)
        )
        self.rate_window = int(
            getattr(settings, "RATE_LIMIT_WINDOW", self.DEFAULT_RATE_WINDOW)
        )
        self.auth_rate_limit = int(
            getattr(settings, "AUTH_RATE_LIMIT_REQUESTS", self.DEFAULT_AUTH_RATE_LIMIT)
        )

    def __call__(self, request: HttpRequest) -> HttpResponse:
        deny_response = self.process_request(request)
        if deny_response is not None:
            return deny_response

        response = self.get_response(request)
        return self.process_response(request, response)

    def process_request(self, request: HttpRequest) -> HttpResponse | None:
        if self._should_skip(request.path):
            return None

        if self._payload_too_large(request):
            return self._deny("Request payload too large", 413)

        if self._blocked_user_agent(request):
            return self._deny("Request blocked", 403)

        ip = self._client_ip(request)
        if not self._is_rate_limit_ok(ip, request):
            return self._deny("Too many requests", 429)

        if self._invalid_content_type(request):
            return self._deny("Unsupported content type", 415)

        if self._has_attack_signature(request):
            logger.warning(
                "Suspicious request blocked ip=%s method=%s path=%s",
                ip,
                request.method,
                request.path,
            )
            return self._deny("Suspicious request blocked", 403)

        return None

    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        response["X-Content-Type-Options"] = "nosniff"
        response["X-Frame-Options"] = "DENY"
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response["Cross-Origin-Opener-Policy"] = "same-origin"
        response["Cross-Origin-Resource-Policy"] = "same-site"
        response["Cross-Origin-Embedder-Policy"] = "unsafe-none"
        response["X-Permitted-Cross-Domain-Policies"] = "none"

        # Keep inline style for existing app styling, but otherwise strict.
        response["Content-Security-Policy"] = (
            "default-src 'self'; "
            "base-uri 'self'; "
            "object-src 'none'; "
            "frame-ancestors 'none'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https:; "
            "form-action 'self'"
        )

        if request.path.startswith(("/auth/", "/products/", "/cart/", "/orders/", "/coupons/", "/wishlist/", "/activity-logs/", "/contact/", "/config/", "/reviews/")):
            remaining = self._remaining_limit(request)
            if remaining is not None:
                response["X-RateLimit-Limit"] = str(self._route_limit(request.path))
                response["X-RateLimit-Remaining"] = str(max(remaining, 0))
                response["X-RateLimit-Window"] = str(self.rate_window)
        return response

    def _should_skip(self, path: str) -> bool:
        return path.startswith(("/static/", "/media/", "/admin/jsi18n/"))

    def _client_ip(self, request: HttpRequest) -> str:
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "unknown")

    def _bucket_key(self, ip: str, path: str) -> str:
        bucket = int(timezone.now().timestamp() // self.rate_window)
        limit_key = "auth" if path.startswith("/auth/") else "api"
        return f"rl:{limit_key}:{ip}:{bucket}"

    def _route_limit(self, path: str) -> int:
        return self.auth_rate_limit if path.startswith("/auth/") else self.rate_limit

    def _is_rate_limit_ok(self, ip: str, request: HttpRequest) -> bool:
        key = self._bucket_key(ip, request.path)
        limit = self._route_limit(request.path)
        try:
            if cache.add(key, 1, timeout=self.rate_window + 5):
                return True
            current = cache.incr(key)
            return current <= limit
        except (RedisError, InvalidCacheBackendError, ValueError, TypeError):
            return True

    def _remaining_limit(self, request: HttpRequest) -> int | None:
        key = self._bucket_key(self._client_ip(request), request.path)
        try:
            value = cache.get(key)
        except (RedisError, InvalidCacheBackendError, ValueError, TypeError):
            return None
        if value is None:
            return self._route_limit(request.path)
        try:
            return self._route_limit(request.path) - int(value)
        except (ValueError, TypeError):
            return None

    def _payload_too_large(self, request: HttpRequest) -> bool:
        content_length = request.META.get("CONTENT_LENGTH")
        if not content_length:
            return False
        try:
            return int(content_length) > self.max_request_size
        except (TypeError, ValueError):
            return False

    def _blocked_user_agent(self, request: HttpRequest) -> bool:
        ua = (request.META.get("HTTP_USER_AGENT") or "").lower()
        if not ua:
            return False
        return any(flag in ua for flag in self.BLOCKED_UA_SUBSTRINGS)

    def _invalid_content_type(self, request: HttpRequest) -> bool:
        if request.method not in {"POST", "PUT", "PATCH"}:
            return False
        if not request.path.startswith(("/auth/", "/products/", "/cart/", "/orders/", "/coupons/", "/wishlist/", "/activity-logs/", "/contact/", "/config/", "/reviews/")):
            return False
        content_type = (request.META.get("CONTENT_TYPE") or "").lower()
        if not content_type:
            return False
        return not (
            "application/json" in content_type
            or "application/x-www-form-urlencoded" in content_type
            or "multipart/form-data" in content_type
        )

    def _has_attack_signature(self, request: HttpRequest) -> bool:
        for value in self._request_values(request):
            if any(pattern.search(value) for pattern in self.ATTACK_PATTERNS):
                return True
        return False

    def _request_values(self, request: HttpRequest) -> Iterable[str]:
        yield request.path or ""
        if request.META.get("QUERY_STRING"):
            yield request.META["QUERY_STRING"]
        for _, value in request.GET.items():
            yield str(value)
        if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            try:
                body = request.body.decode("utf-8", errors="ignore")
            except UnicodeDecodeError:
                body = ""
            if body:
                yield body

    def _deny(self, message: str, status: int) -> JsonResponse:
        return JsonResponse(
            {
                "error": message,
                "status": status,
                "timestamp": timezone.now().isoformat(),
            },
            status=status,
        )
