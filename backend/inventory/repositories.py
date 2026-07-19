from django.utils import timezone
from django.db.models import Q
from inventory.models import Product, ProductVariant, PriceList, PriceListItem, RentalPeriod

class ProductRepository:
    @staticmethod
    def get_all():
        return Product.objects.all().prefetch_related('variants')

    @staticmethod
    def get_by_id(product_id):
        try:
            return Product.objects.prefetch_related('variants').get(pk=product_id)
        except Product.DoesNotExist:
            return None

    @staticmethod
    def get_by_sku(sku):
        try:
            return Product.objects.get(sku=sku)
        except Product.DoesNotExist:
            return None

    @staticmethod
    def update_stock(product, qty_change):
        # Can accept positive or negative values
        product.stock_qty += qty_change
        product.save()
        return product

class PriceListRepository:
    @staticmethod
    def get_active_pricelist():
        now = timezone.now()
        # Find a custom active pricelist, or fallback to default
        active = PriceList.objects.filter(
            Q(start_date__lte=now, end_date__gte=now) | Q(start_date__isnull=True, end_date__isnull=True)
        ).order_by('-is_default').first()
        return active

    @staticmethod
    def get_product_price(product, pricelist=None):
        if not pricelist:
            pricelist = PriceListRepository.get_active_pricelist()
        if pricelist:
            try:
                item = PriceListItem.objects.get(pricelist=pricelist, product=product)
                return item.custom_price
            except PriceListItem.DoesNotExist:
                pass
        return product.base_price

class RentalPeriodRepository:
    @staticmethod
    def get_all():
        return RentalPeriod.objects.all()
