from django.core.management.base import BaseCommand, CommandError
from django.test import Client

from config.api_contracts import API_CONTRACTS


DEFAULT_PAYLOADS = {
    ('POST', '/auth/register/'): {
        'phone': '1234567890',
        'username': 'smoketest_user',
        'first_name': 'Smoke',
        'last_name': 'Test',
        'password': 'Invalid1!',
    },
    ('POST', '/auth/login/'): {'phone': '1234567890', 'password': 'Invalid1!'},
    ('POST', '/auth/refresh/'): {'refresh': 'invalid-token'},
    ('POST', '/coupons/validate/'): {'code': ''},
    ('POST', '/orders/'): {'items': []},
}


class Command(BaseCommand):
    help = 'Run live endpoint smoke checks and fail on any 5xx/contract-breaking response.'

    def handle(self, *args, **options):
        client = Client()
        failures = []

        for contract in API_CONTRACTS:
            path = contract['path']
            method = contract['method'].upper()
            auth_required = contract['auth_required']

            payload = DEFAULT_PAYLOADS.get((method, path), {})
            request_callable = getattr(client, method.lower())

            response = request_callable(path, data=payload, content_type='application/json')
            status_code = response.status_code

            if status_code >= 500:
                failures.append(f'{path} [{method}] -> {status_code} server_error')
                continue

            if auth_required and status_code not in {401, 403} and path not in {'/orders/'}:
                failures.append(f'{path} [{method}] -> expected unauthorized without token, got {status_code}')

            if not auth_required and status_code in {401, 403}:
                failures.append(f'{path} [{method}] -> unexpectedly unauthorized ({status_code})')

        if failures:
            for item in failures:
                self.stderr.write(self.style.ERROR(item))
            raise CommandError(f'Smoke run failed with {len(failures)} issue(s).')

        self.stdout.write(self.style.SUCCESS(f'Smoke run passed: {len(API_CONTRACTS)} endpoint checks.'))
