# Generated manually to remove orphaned email_verified fields

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_merge_20251118_2233'),
    ]

    operations = [
        migrations.RunSQL(
            sql='ALTER TABLE custom_user DROP COLUMN IF EXISTS email_verified;',
            reverse_sql='ALTER TABLE custom_user ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;',
        ),
        migrations.RunSQL(
            sql='ALTER TABLE custom_user DROP COLUMN IF EXISTS last_verification_email_sent;',
            reverse_sql='ALTER TABLE custom_user ADD COLUMN last_verification_email_sent TIMESTAMP WITH TIME ZONE;',
        ),
    ]
