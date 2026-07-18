import uuid
from django.db import migrations, models


def populate_public_ids(apps, schema_editor):
    RentalOrder = apps.get_model('rentals', 'RentalOrder')
    for order in RentalOrder.objects.filter(public_id__isnull=True).iterator():
        order.public_id = uuid.uuid4()
        order.save(update_fields=['public_id'])


class Migration(migrations.Migration):
    dependencies = [('rentals', '0001_initial')]
    operations = [
        migrations.AddField(model_name='rentalorder', name='public_id', field=models.UUIDField(blank=True, editable=False, null=True)),
        migrations.RunPython(populate_public_ids, migrations.RunPython.noop),
        migrations.AlterField(model_name='rentalorder', name='public_id', field=models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
    ]
