"""
Pricing service for calculating taxes, delivery, and discounts.
"""
from decimal import Decimal


class PricingService:
    """Service for handling pricing calculations."""
    
    TAX_RATE = Decimal('0.08')  # 8% tax
    DELIVERY_STANDARD = Decimal('50')
    DELIVERY_EXPRESS = Decimal('100')
    FREE_DELIVERY_THRESHOLD = Decimal('500')
    
    @classmethod
    def calculate_tax(cls, subtotal):
        """Calculate tax (8% of subtotal)."""
        return subtotal * cls.TAX_RATE
    
    @classmethod
    def calculate_delivery(cls, subtotal, delivery_type='standard'):
        """Calculate delivery charge based on order total and type."""
        if subtotal >= cls.FREE_DELIVERY_THRESHOLD:
            return Decimal('0')
        
        if delivery_type == 'express':
            return cls.DELIVERY_EXPRESS
        return cls.DELIVERY_STANDARD
    
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