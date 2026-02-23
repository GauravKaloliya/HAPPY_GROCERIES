"""
Pricing service for calculating taxes, delivery, and discounts.
"""
from decimal import Decimal


class PricingService:
    """Service for handling pricing calculations."""
    
    TAX_RATE = Decimal('0.08')  # 8% tax
    DELIVERY_STANDARD = Decimal('40')  # Standard delivery charge
    DELIVERY_EXPRESS = Decimal('50')   # Express delivery charge (fixed at 50 as per requirements)
    FREE_DELIVERY_THRESHOLD = Decimal('500')
    MIN_ORDER_VALUE = Decimal('100')  # Minimum order value
    MAX_COD_ORDER_VALUE = Decimal('2000')  # Maximum order value for COD
    
    @classmethod
    def get_settings(cls):
        """Get settings from database if available."""
        try:
            from site_config.models import SiteSettings
            settings = SiteSettings.get_settings()
            return {
                'tax_rate': settings.tax_rate,
                'standard_delivery_charge': settings.standard_delivery_charge,
                'express_delivery_charge': settings.express_delivery_charge,
                'free_delivery_threshold': settings.free_delivery_threshold,
                'min_order_value': settings.min_order_value,
                'max_cod_order_value': settings.max_cod_order_value or cls.MAX_COD_ORDER_VALUE,
            }
        except Exception:
            # Return defaults if database is not available
            return {
                'tax_rate': cls.TAX_RATE,
                'standard_delivery_charge': cls.DELIVERY_STANDARD,
                'express_delivery_charge': cls.DELIVERY_EXPRESS,
                'free_delivery_threshold': cls.FREE_DELIVERY_THRESHOLD,
                'min_order_value': cls.MIN_ORDER_VALUE,
                'max_cod_order_value': cls.MAX_COD_ORDER_VALUE,
            }
    
    @classmethod
    def calculate_tax(cls, subtotal):
        """Calculate tax based on settings."""
        settings = cls.get_settings()
        return subtotal * settings['tax_rate']
    
    @classmethod
    def calculate_delivery(cls, subtotal, delivery_type='standard'):
        """Calculate delivery charge based on order total and type."""
        settings = cls.get_settings()
        if subtotal >= settings['free_delivery_threshold']:
            return Decimal('0')
        
        if delivery_type == 'express':
            return settings['express_delivery_charge']
        return settings['standard_delivery_charge']
    
    @classmethod
    def get_min_order_value(cls):
        """Get minimum order value from settings."""
        settings = cls.get_settings()
        return settings['min_order_value']
    
    @classmethod
    def get_max_cod_order_value(cls):
        """Get maximum COD order value from settings."""
        settings = cls.get_settings()
        return settings['max_cod_order_value']
    
    @classmethod
    def is_cod_available(cls, total):
        """Check if COD is available for the given order total."""
        return total <= cls.get_max_cod_order_value()
    
    @classmethod
    def validate_min_order(cls, subtotal):
        """Validate that order meets minimum order value."""
        settings = cls.get_settings()
        return subtotal >= settings['min_order_value']
    
    @classmethod
    def calculate_coupon_discount(cls, coupon, cart_items, cart_total):
        """Calculate discount amount based on coupon type and cart contents."""
        if not coupon:
            return Decimal('0')
        
        discount_amount = Decimal('0')
        
        if coupon.coupon_type == 'fixed':
            discount_amount = Decimal(str(coupon.value))
        elif coupon.coupon_type == 'percentage':
            discount_amount = cart_total * (Decimal(str(coupon.value)) / Decimal('100'))
        elif coupon.coupon_type == 'category':
            # Calculate discount only for items in specified categories
            applicable_categories = coupon.applicable_categories or []
            if applicable_categories:
                category_total = sum(
                    item.total for item in cart_items
                    if item.product.category.name in applicable_categories
                )
                discount_amount = category_total * (Decimal(str(coupon.value)) / Decimal('100'))
        
        # Apply maximum discount cap
        if coupon.max_discount:
            max_discount = Decimal(str(coupon.max_discount))
            discount_amount = min(discount_amount, max_discount)
        
        # Ensure discount doesn't exceed cart total
        return min(discount_amount, cart_total)
    
    @classmethod
    def calculate_total(cls, subtotal, tax, delivery_charge, coupon_discount=0):
        """Calculate final total."""
        return subtotal + tax + delivery_charge - coupon_discount
    
    @classmethod
    def calculate_delivery_estimate(cls, cart_items, delivery_type='standard'):
        """Calculate estimated delivery time in minutes."""
        total_items = sum(item.quantity for item in cart_items)
        
        # Base delivery time
        base_minutes = 45 if delivery_type == 'standard' else 30
        
        # Add 5 minutes per 500 items
        additional_minutes = (total_items // 500) * 5
        
        return base_minutes + additional_minutes
    
    @classmethod
    def format_currency(cls, amount):
        """Format amount as currency."""
        return f"₹{amount:.2f}"