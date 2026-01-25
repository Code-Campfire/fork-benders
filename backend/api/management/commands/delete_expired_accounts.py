from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import CustomUser


class Command(BaseCommand):
    help = 'Delete user accounts that requested deletion 7+ days ago'

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(days=7)
        
        users_to_delete = CustomUser.objects.filter(
            deletion_requested_at__isnull=False,
            deletion_requested_at__lte=cutoff
        )
        
        count = users_to_delete.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No accounts to delete'))
            return
        
        # Log emails before deletion (for audit trail)
        for user in users_to_delete:
            self.stdout.write(f'Deleting account: {user.email}')
            # TODO: Send final deletion confirmation email here
        
        # Perform CASCADE deletion
        users_to_delete.delete()
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {count} account(s)')
        )