from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Run formal security and observability hardening review checks.'

    def handle(self, *args, **options):
        checks = [
            ('SECURE_SSL_REDIRECT', bool(getattr(settings, 'SECURE_SSL_REDIRECT', False))),
            ('SESSION_COOKIE_SECURE', bool(getattr(settings, 'SESSION_COOKIE_SECURE', False))),
            ('CSRF_COOKIE_SECURE', bool(getattr(settings, 'CSRF_COOKIE_SECURE', False))),
            ('SECURE_HSTS_SECONDS>0', int(getattr(settings, 'SECURE_HSTS_SECONDS', 0)) > 0),
            ('CORS_ALLOW_ALL_ORIGINS=False', not bool(getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', True))),
            ('MAX_REQUEST_SIZE<=10MB', int(getattr(settings, 'MAX_REQUEST_SIZE', 0)) <= 10 * 1024 * 1024),
            ('RATE_LIMIT_REQUESTS<=200', int(getattr(settings, 'RATE_LIMIT_REQUESTS', 9999)) <= 200),
            ('AUTH_RATE_LIMIT_REQUESTS<=50', int(getattr(settings, 'AUTH_RATE_LIMIT_REQUESTS', 9999)) <= 50),
            ('Redis cache backend', settings.CACHES['default']['BACKEND'] == 'django.core.cache.backends.redis.RedisCache'),
            ('Observability middleware enabled', 'config.observability_middleware.ObservabilityMiddleware' in settings.MIDDLEWARE),
            ('Security middleware enabled', 'config.security_middleware.SecurityMiddleware' in settings.MIDDLEWARE),
            ('Custom DRF exception handler enabled', settings.REST_FRAMEWORK.get('EXCEPTION_HANDLER') == 'config.exceptions.custom_exception_handler'),
            ('JSON logging formatter configured', 'json' in settings.LOGGING.get('formatters', {})),
            ('request_id filter configured', 'request_id' in settings.LOGGING.get('filters', {})),
            ('observability logger configured', 'observability' in settings.LOGGING.get('loggers', {})),
            ('api_errors logger configured', 'api_errors' in settings.LOGGING.get('loggers', {})),
        ]

        failures = [name for name, ok in checks if not ok]

        for name, ok in checks:
            marker = self.style.SUCCESS('PASS') if ok else self.style.ERROR('FAIL')
            self.stdout.write(f'[{marker}] {name}')

        if failures:
            raise CommandError(f'Security/observability review failed ({len(failures)} checks).')

        self.stdout.write(self.style.SUCCESS(f'Security/observability review passed ({len(checks)} checks).'))
