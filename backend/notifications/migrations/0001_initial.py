from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [migrations.CreateModel(name='Notification', fields=[
        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
        ('channel', models.CharField(choices=[('in_app', 'In app'), ('email', 'Email'), ('sms', 'SMS'), ('whatsapp', 'WhatsApp')], default='in_app', max_length=16)),
        ('event', models.CharField(max_length=64)), ('subject', models.CharField(max_length=200)), ('body', models.TextField()),
        ('status', models.CharField(choices=[('queued', 'Queued'), ('sent', 'Sent'), ('failed', 'Failed')], default='queued', max_length=16)),
        ('payload', models.JSONField(blank=True, default=dict)), ('sent_at', models.DateTimeField(blank=True, null=True)), ('created_at', models.DateTimeField(auto_now_add=True)),
        ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
    ], options={'ordering': ('-created_at',)})]
