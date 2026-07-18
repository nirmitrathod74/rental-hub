import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rentalhub.settings')
django.setup()

from inventory.models import Product

def main():
    skus = ['EXC-001', 'GEN-50K', 'SCA-05']
    for sku in skus:
        try:
            product = Product.objects.get(sku=sku)
            filename = f"{sku.lower()}.png"
            product.image = f'products/{filename}'
            product.save()
            print(f"Updated {sku} to use image {filename}")
        except Product.DoesNotExist:
            print(f"Product {sku} not found")

if __name__ == '__main__':
    main()
