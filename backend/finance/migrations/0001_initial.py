import uuid
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [('rentals', '0001_initial')]
    operations = [
        migrations.CreateModel(name='Payment', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('reference', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
            ('payment_type', models.CharField(choices=[('rental', 'Rental'), ('deposit', 'Deposit'), ('refund', 'Refund'), ('late_fee', 'Late fee')], max_length=16)),
            ('amount', models.DecimalField(decimal_places=2, max_digits=10)), ('status', models.CharField(choices=[('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed'), ('refunded', 'Refunded')], default='pending', max_length=16)),
            ('provider', models.CharField(default='manual', max_length=40)), ('provider_reference', models.CharField(blank=True, max_length=128)), ('created_at', models.DateTimeField(auto_now_add=True)), ('settled_at', models.DateTimeField(blank=True, null=True)),
            ('rental_order', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='payments', to='rentals.rentalorder')),
        ]),
        migrations.CreateModel(name='Invoice', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), ('number', models.CharField(max_length=32, unique=True)),
            ('subtotal', models.DecimalField(decimal_places=2, max_digits=10)), ('tax', models.DecimalField(decimal_places=2, default=0, max_digits=10)), ('total', models.DecimalField(decimal_places=2, max_digits=10)),
            ('status', models.CharField(choices=[('draft', 'Draft'), ('issued', 'Issued'), ('paid', 'Paid'), ('void', 'Void')], default='draft', max_length=16)), ('issued_at', models.DateTimeField(blank=True, null=True)), ('created_at', models.DateTimeField(auto_now_add=True)),
            ('rental_order', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='invoices', to='rentals.rentalorder')),
        ]),
    ]
