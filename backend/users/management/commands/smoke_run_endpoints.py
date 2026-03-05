import json

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
        'password_confirm': 'Invalid1!',
    },
    ('POST', '/auth/login/'): {'phone': '1234567890', 'password': 'Invalid1!'},
    ('POST', '/auth/refresh/'): {'refresh': 'invalid-token'},
    ('POST', '/coupons/validate/'): {'code': ''},
    ('POST', '/orders/'): {'items': []},
}


class Command(BaseCommand):
    help = 'Run live endpoint smoke checks and fail on any 5xx/contract-breaking response.'

    def handle(self, *args, **options):
        client = Client(
            SERVER_NAME='localhost',
            SERVER_PORT='80',
            raise_request_exception=False,
        )
        failures = []

        for contract in API_CONTRACTS:
            path = contract['path']
            method = contract['method'].upper()
            expected_statuses = set(contract.get('expected_statuses', []))

            payload = DEFAULT_PAYLOADS.get((method, path), {})
            request_callable = getattr(client, method.lower())
            request_body = json.dumps(payload) if method in {'POST', 'PATCH', 'PUT'} else payload

            response = request_callable(path, data=request_body, content_type='application/json')
            status_code = response.status_code

            if status_code >= 500:
                failures.append(f'{path} [{method}] -> {status_code} server_error')
                continue

            if status_code == 405:
                failures.append(f'{path} [{method}] -> method_not_allowed')
                continue

            if expected_statuses and status_code not in expected_statuses:
                failures.append(
                    f'{path} [{method}] -> unexpected_status={status_code}, '
                    f'expected_one_of={sorted(expected_statuses)}'
                )

        if failures:
            for item in failures:
                self.stderr.write(self.style.ERROR(item))
            raise CommandError(f'Smoke run failed with {len(failures)} issue(s).')

        self.stdout.write(self.style.SUCCESS(f'Smoke run passed: {len(API_CONTRACTS)} endpoint checks.'))
