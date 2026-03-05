from django.core.management.base import BaseCommand, CommandError
from django.urls import resolve, Resolver404
from rest_framework.permissions import AllowAny

from config.api_contracts import API_CONTRACTS


class Command(BaseCommand):
    help = 'Verify endpoint contract registry (route existence, method support, auth expectation).'

    def handle(self, *args, **options):
        failures = []

        for contract in API_CONTRACTS:
            path = contract['path']
            method = contract['method'].upper()
            auth_required = contract['auth_required']

            try:
                match = resolve(path)
            except Resolver404:
                failures.append(f'{path} [{method}] -> route_not_found')
                continue

            callback = match.func
            view_cls = getattr(callback, 'cls', None)

            if view_cls is not None:
                actions = getattr(callback, 'actions', None)
                if actions:
                    allowed_methods = {m.upper() for m in actions.keys()}
                else:
                    allowed_methods = {m.upper() for m in getattr(view_cls, 'http_method_names', [])}

                if method not in allowed_methods:
                    failures.append(f'{path} [{method}] -> method_not_supported ({sorted(allowed_methods)})')

                permission_classes = getattr(view_cls, 'permission_classes', [])
                has_allow_any = any(p is AllowAny for p in permission_classes)
                actual_auth_required = not has_allow_any

                if actual_auth_required != auth_required:
                    failures.append(
                        f'{path} [{method}] -> auth_mismatch expected={auth_required} actual={actual_auth_required}'
                    )
            else:
                if method != 'GET':
                    failures.append(f'{path} [{method}] -> non_class_view_method_check_skipped')

        if failures:
            for item in failures:
                self.stderr.write(self.style.ERROR(item))
            raise CommandError(f'Contract verification failed with {len(failures)} issue(s).')

        self.stdout.write(self.style.SUCCESS(f'Endpoint contracts verified: {len(API_CONTRACTS)} checks passed.'))
