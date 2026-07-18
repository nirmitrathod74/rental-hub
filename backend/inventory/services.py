from inventory.repositories import ProductRepository, PriceListRepository
from inventory.models import Product, ProductVariant

class InventoryService:
    @staticmethod
    def create_product(product_data, variants_data=None):
        product = Product.objects.create(**product_data)
        if variants_data:
            for var in variants_data:
                ProductVariant.objects.create(
                    product=product,
                    attribute_name=var.get('attribute_name'),
                    attribute_value=var.get('attribute_value')
                )
        return product

    @staticmethod
    def get_product_details(product_id, pricelist_id=None):
        product = ProductRepository.get_by_id(product_id)
        if not product:
            return None
            
        # Get active price
        price = PriceListRepository.get_product_price(product, pricelist_id)
        
        # Calculate deposit
        deposit = product.security_deposit_value
        if product.security_deposit_type == 'percentage':
            deposit = (product.security_deposit_value / 100) * price

        return {
            'product': product,
            'price': price,
            'deposit': deposit
        }

    @staticmethod
    def is_available(product, quantity=1):
        return product.available_qty >= quantity
