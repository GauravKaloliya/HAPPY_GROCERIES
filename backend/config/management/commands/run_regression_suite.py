from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Run full backend regression suite (contracts + live smoke + security/observability review).'

    def handle(self, *args, **options):
        call_command('verify_endpoint_contracts')
        call_command('smoke_run_endpoints')
        call_command('security_observability_review')
        self.stdout.write(self.style.SUCCESS('Regression suite passed.'))
