"""
Database seeding script for initial data.
Run with: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from products.models import Category, Product
from coupons.models import Coupon


class Command(BaseCommand):
    help = 'Seed the database with initial data'
    
    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create categories
        categories_data = [
            {'name': 'Fruits', 'emoji': '🍎', 'description': 'Fresh fruits from local farms'},
            {'name': 'Vegetables', 'emoji': '🥕', 'description': 'Fresh vegetables for a healthy diet'},
            {'name': 'Dairy', 'emoji': '🥛', 'description': 'Dairy products including milk, cheese, and more'},
            {'name': 'Snacks', 'emoji': '🍪', 'description': 'Delicious snacks for every mood'},
            {'name': 'Beverages', 'emoji': '🧃', 'description': 'Refreshing drinks and beverages'},
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, _ = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'emoji': cat_data['emoji'],
                    'description': cat_data['description']
                }
            )
            categories[cat_data['name']] = category
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(categories)} categories'))
        
        # Products data (from legacy search.js)
        products_data = [
            # Fruits
            {'name': 'Apple', 'price': 50, 'category': 'Fruits', 'emoji': '🍎', 'rating': 4.5, 'reviewsCount': 128, 'stock': 25, 'discountPercent': 15, 'description': 'Crisp, juicy apples packed with fiber and natural sweetness.'},
            {'name': 'Banana', 'price': 30, 'category': 'Fruits', 'emoji': '🍌', 'rating': 4.2, 'reviewsCount': 94, 'stock': 40, 'discountPercent': 20, 'description': 'Naturally sweet bananas rich in potassium.'},
            {'name': 'Orange', 'price': 40, 'category': 'Fruits', 'emoji': '🍊', 'rating': 4.3, 'reviewsCount': 76, 'stock': 30, 'discountPercent': 18, 'description': 'Fresh oranges bursting with vitamin C.'},
            {'name': 'Grapes', 'price': 80, 'category': 'Fruits', 'emoji': '🍇', 'rating': 4.6, 'reviewsCount': 62, 'stock': 18, 'discountPercent': 25, 'description': 'Sweet, seedless grapes perfect for snacking.'},
            {'name': 'Strawberry', 'price': 120, 'category': 'Fruits', 'emoji': '🍓', 'rating': 4.8, 'reviewsCount': 141, 'stock': 10, 'discountPercent': 30, 'description': 'Bright, fragrant strawberries with sweet-tart taste.'},
            {'name': 'Watermelon', 'price': 60, 'category': 'Fruits', 'emoji': '🍉', 'rating': 4.4, 'reviewsCount': 58, 'stock': 12, 'discountPercent': 12, 'description': 'Refreshing watermelon with high water content.'},
            {'name': 'Mango', 'price': 100, 'category': 'Fruits', 'emoji': '🥭', 'rating': 4.7, 'reviewsCount': 115, 'stock': 20, 'discountPercent': 25, 'description': 'Sweet and juicy Alphonso mangoes.'},
            {'name': 'Pineapple', 'price': 80, 'category': 'Fruits', 'emoji': '🍍', 'rating': 4.5, 'reviewsCount': 82, 'stock': 15, 'discountPercent': 20, 'description': 'Tropical pineapples with sweet-tangy flavor.'},
            {'name': 'Kiwi', 'price': 120, 'category': 'Fruits', 'emoji': '🥝', 'rating': 4.6, 'reviewsCount': 64, 'stock': 25, 'discountPercent': 0, 'description': 'Tangy and vitamin-rich kiwis.'},
            {'name': 'Papaya', 'price': 50, 'category': 'Fruits', 'emoji': '🍈', 'rating': 4.2, 'reviewsCount': 45, 'stock': 18, 'discountPercent': 18, 'description': 'Ripe and sweet papayas.'},
            {'name': 'Guava', 'price': 40, 'category': 'Fruits', 'emoji': '🍈', 'rating': 4.1, 'reviewsCount': 38, 'stock': 30, 'discountPercent': 22, 'description': 'Fresh pink guavas full of vitamin C.'},
            {'name': 'Pomegranate', 'price': 150, 'category': 'Fruits', 'emoji': '🍎', 'rating': 4.8, 'reviewsCount': 92, 'stock': 12, 'discountPercent': 0, 'description': 'Juicy red pomegranate pearls.'},
            {'name': 'Blueberry', 'price': 300, 'category': 'Fruits', 'emoji': '🫐', 'rating': 4.9, 'reviewsCount': 156, 'stock': 10, 'discountPercent': 0, 'description': 'Premium fresh blueberries.'},
            {'name': 'Peach', 'price': 180, 'category': 'Fruits', 'emoji': '🍑', 'rating': 4.4, 'reviewsCount': 53, 'stock': 14, 'discountPercent': 0, 'description': 'Soft and sweet peaches.'},
            {'name': 'Cherry', 'price': 250, 'category': 'Fruits', 'emoji': '🍒', 'rating': 4.7, 'reviewsCount': 124, 'stock': 8, 'discountPercent': 0, 'description': 'Sweet red cherries.'},
            {'name': 'Avocado', 'price': 200, 'category': 'Fruits', 'emoji': '🥑', 'rating': 4.3, 'reviewsCount': 89, 'stock': 12, 'discountPercent': 0, 'description': 'Creamy ripe avocados.'},
            
            # Vegetables
            {'name': 'Carrot', 'price': 30, 'category': 'Vegetables', 'emoji': '🥕', 'rating': 4.0, 'reviewsCount': 44, 'stock': 35, 'discountPercent': 20, 'description': 'Crunchy carrots rich in beta-carotene.'},
            {'name': 'Tomato', 'price': 25, 'category': 'Vegetables', 'emoji': '🍅', 'rating': 4.1, 'reviewsCount': 52, 'stock': 28, 'discountPercent': 15, 'description': 'Juicy tomatoes for curries and salads.'},
            {'name': 'Broccoli', 'price': 45, 'category': 'Vegetables', 'emoji': '🥦', 'rating': 4.2, 'reviewsCount': 39, 'stock': 16, 'discountPercent': 18, 'description': 'Fresh broccoli florets loaded with nutrients.'},
            {'name': 'Cucumber', 'price': 35, 'category': 'Vegetables', 'emoji': '🥒', 'rating': 3.9, 'reviewsCount': 31, 'stock': 22, 'discountPercent': 22, 'description': 'Cool and crisp cucumbers.'},
            {'name': 'Potato', 'price': 20, 'category': 'Vegetables', 'emoji': '🥔', 'rating': 4.0, 'reviewsCount': 67, 'stock': 50, 'discountPercent': 10, 'description': 'Versatile potatoes for everyday cooking.'},
            {'name': 'Corn', 'price': 40, 'category': 'Vegetables', 'emoji': '🌽', 'rating': 4.3, 'reviewsCount': 46, 'stock': 20, 'discountPercent': 16, 'description': 'Sweet corn for boiling and grilling.'},
            {'name': 'Spinach', 'price': 30, 'category': 'Vegetables', 'emoji': '🥬', 'rating': 4.5, 'reviewsCount': 78, 'stock': 40, 'discountPercent': 15, 'description': 'Fresh green spinach leaves.'},
            {'name': 'Cauliflower', 'price': 50, 'category': 'Vegetables', 'emoji': '🥦', 'rating': 4.1, 'reviewsCount': 42, 'stock': 22, 'discountPercent': 18, 'description': 'Fresh white cauliflower florets.'},
            {'name': 'Cabbage', 'price': 40, 'category': 'Vegetables', 'emoji': '🥬', 'rating': 4.0, 'reviewsCount': 35, 'stock': 25, 'discountPercent': 20, 'description': 'Crunchy green cabbage.'},
            {'name': 'Onion', 'price': 45, 'category': 'Vegetables', 'emoji': '🧅', 'rating': 4.2, 'reviewsCount': 160, 'stock': 100, 'discountPercent': 10, 'description': 'Essential red onions.'},
            {'name': 'Garlic', 'price': 20, 'category': 'Vegetables', 'emoji': '🧄', 'rating': 4.6, 'reviewsCount': 95, 'stock': 60, 'discountPercent': 12, 'description': 'Pungent and flavorful garlic cloves.'},
            {'name': 'Bell Pepper', 'price': 80, 'category': 'Vegetables', 'emoji': '🫑', 'rating': 4.4, 'reviewsCount': 67, 'stock': 15, 'discountPercent': 15, 'description': 'Vibrant and crunchy bell peppers.'},
            {'name': 'Sweet Potato', 'price': 60, 'category': 'Vegetables', 'emoji': '🍠', 'rating': 4.3, 'reviewsCount': 48, 'stock': 30, 'discountPercent': 18, 'description': 'Nutritious sweet potatoes.'},
            {'name': 'Peas', 'price': 70, 'category': 'Vegetables', 'emoji': '🫛', 'rating': 4.5, 'reviewsCount': 52, 'stock': 20, 'discountPercent': 20, 'description': 'Fresh green peas.'},
            {'name': 'Beans', 'price': 50, 'category': 'Vegetables', 'emoji': '🫛', 'rating': 4.2, 'reviewsCount': 41, 'stock': 25, 'discountPercent': 16, 'description': 'Fresh green beans.'},
            {'name': 'Mushrooms', 'price': 90, 'category': 'Vegetables', 'emoji': '🍄', 'rating': 4.7, 'reviewsCount': 84, 'stock': 12, 'discountPercent': 0, 'description': 'Fresh button mushrooms.'},
            
            # Dairy
            {'name': 'Milk', 'price': 55, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.5, 'reviewsCount': 110, 'stock': 24, 'discountPercent': 10, 'description': 'Fresh, creamy milk.'},
            {'name': 'Cheese', 'price': 150, 'category': 'Dairy', 'emoji': '🧀', 'rating': 4.7, 'reviewsCount': 88, 'stock': 14, 'discountPercent': 15, 'description': 'Rich and flavorful cheese.'},
            {'name': 'Butter', 'price': 180, 'category': 'Dairy', 'emoji': '🧈', 'rating': 4.6, 'reviewsCount': 73, 'stock': 9, 'discountPercent': 8, 'description': 'Creamy butter for spreading.'},
            {'name': 'Yogurt', 'price': 60, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.4, 'reviewsCount': 66, 'stock': 18, 'discountPercent': 12, 'description': 'Smooth yogurt.'},
            {'name': 'Paneer', 'price': 120, 'category': 'Dairy', 'emoji': '🧀', 'rating': 4.8, 'reviewsCount': 142, 'stock': 18, 'discountPercent': 12, 'description': 'Fresh cottage cheese.'},
            {'name': 'Ghee', 'price': 600, 'category': 'Dairy', 'emoji': '🧈', 'rating': 4.9, 'reviewsCount': 215, 'stock': 15, 'discountPercent': 10, 'description': 'Pure cow ghee.'},
            {'name': 'Ice Cream', 'price': 250, 'category': 'Dairy', 'emoji': '🍦', 'rating': 4.7, 'reviewsCount': 188, 'stock': 10, 'discountPercent': 15, 'description': 'Creamy vanilla ice cream.'},
            {'name': 'Buttermilk', 'price': 30, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.2, 'reviewsCount': 63, 'stock': 40, 'discountPercent': 8, 'description': 'Refreshing buttermilk.'},
            {'name': 'Flavored Yogurt', 'price': 80, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.5, 'reviewsCount': 76, 'stock': 25, 'discountPercent': 12, 'description': 'Delicious fruit-flavored yogurt.'},
            {'name': 'Whipped Cream', 'price': 150, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.3, 'reviewsCount': 45, 'stock': 12, 'discountPercent': 0, 'description': 'Light and fluffy whipped cream.'},
            {'name': 'Sour Cream', 'price': 120, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.1, 'reviewsCount': 32, 'stock': 15, 'discountPercent': 0, 'description': 'Thick and tangy sour cream.'},
            {'name': 'Condensed Milk', 'price': 180, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.6, 'reviewsCount': 87, 'stock': 20, 'discountPercent': 10, 'description': 'Sweetened condensed milk.'},
            {'name': 'Soya Milk', 'price': 90, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.0, 'reviewsCount': 42, 'stock': 18, 'discountPercent': 15, 'description': 'Nutritious plant-based soya milk.'},
            {'name': 'Almond Milk', 'price': 250, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.4, 'reviewsCount': 59, 'stock': 14, 'discountPercent': 0, 'description': 'Creamy almond milk.'},
            
            # Snacks
            {'name': 'Cookies', 'price': 80, 'category': 'Snacks', 'emoji': '🍪', 'rating': 4.8, 'reviewsCount': 152, 'stock': 32, 'discountPercent': 25, 'description': 'Crunchy cookies with delightful sweetness.'},
            {'name': 'Chips', 'price': 50, 'category': 'Snacks', 'emoji': '🥔', 'rating': 4.5, 'reviewsCount': 97, 'stock': 45, 'discountPercent': 20, 'description': 'Crispy, salty chips.'},
            {'name': 'Chocolate', 'price': 100, 'category': 'Snacks', 'emoji': '🍫', 'rating': 4.9, 'reviewsCount': 210, 'stock': 27, 'discountPercent': 30, 'description': 'Smooth, indulgent chocolate.'},
            {'name': 'Popcorn', 'price': 70, 'category': 'Snacks', 'emoji': '🍿', 'rating': 4.3, 'reviewsCount': 54, 'stock': 38, 'discountPercent': 35, 'description': 'Light and fluffy popcorn.'},
            {'name': 'Almonds', 'price': 400, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.8, 'reviewsCount': 134, 'stock': 30, 'discountPercent': 15, 'description': 'Premium roasted almonds.'},
            {'name': 'Cashews', 'price': 500, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.9, 'reviewsCount': 122, 'stock': 25, 'discountPercent': 18, 'description': 'Creamy and delicious cashew nuts.'},
            {'name': 'Walnuts', 'price': 600, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.7, 'reviewsCount': 88, 'stock': 20, 'discountPercent': 20, 'description': 'Healthy walnuts.'},
            {'name': 'Raisins', 'price': 150, 'category': 'Snacks', 'emoji': '🍇', 'rating': 4.5, 'reviewsCount': 67, 'stock': 35, 'discountPercent': 22, 'description': 'Sweet and chewy raisins.'},
            {'name': 'Granola', 'price': 250, 'category': 'Snacks', 'emoji': '🥣', 'rating': 4.4, 'reviewsCount': 91, 'stock': 15, 'discountPercent': 25, 'description': 'Crunchy granola with nuts and honey.'},
            {'name': 'Trail Mix', 'price': 300, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.6, 'reviewsCount': 73, 'stock': 20, 'discountPercent': 20, 'description': 'A mix of nuts, seeds, and dried fruits.'},
            {'name': 'Pretzels', 'price': 100, 'category': 'Snacks', 'emoji': '🥨', 'rating': 4.2, 'reviewsCount': 54, 'stock': 40, 'discountPercent': 30, 'description': 'Classic salted pretzels.'},
            {'name': 'Nachos', 'price': 90, 'category': 'Snacks', 'emoji': '🌮', 'rating': 4.3, 'reviewsCount': 86, 'stock': 30, 'discountPercent': 25, 'description': 'Crispy corn nachos.'},
            {'name': 'Peanuts', 'price': 60, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.1, 'reviewsCount': 102, 'stock': 50, 'discountPercent': 15, 'description': 'Roasted and salted peanuts.'},
            {'name': 'Pistachios', 'price': 700, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.8, 'reviewsCount': 115, 'stock': 18, 'discountPercent': 0, 'description': 'Delicious roasted pistachios.'},
            
            # Beverages
            {'name': 'Orange Juice', 'price': 90, 'category': 'Beverages', 'emoji': '🧃', 'rating': 4.4, 'reviewsCount': 61, 'stock': 20, 'discountPercent': 15, 'description': 'Refreshing orange juice.'},
            {'name': 'Coffee', 'price': 200, 'category': 'Beverages', 'emoji': '☕', 'rating': 4.7, 'reviewsCount': 139, 'stock': 15, 'discountPercent': 20, 'description': 'Aromatic coffee.'},
            {'name': 'Tea', 'price': 120, 'category': 'Beverages', 'emoji': '🍵', 'rating': 4.5, 'reviewsCount': 103, 'stock': 22, 'discountPercent': 18, 'description': 'Comforting tea.'},
            {'name': 'Soda', 'price': 40, 'category': 'Beverages', 'emoji': '🥤', 'rating': 3.8, 'reviewsCount': 29, 'stock': 0, 'discountPercent': 0, 'description': 'Classic fizzy soda.'},
            {'name': 'Mango Juice', 'price': 80, 'category': 'Beverages', 'emoji': '🥭', 'rating': 4.6, 'reviewsCount': 94, 'stock': 25, 'discountPercent': 18, 'description': 'Sweet and thick mango nectar.'},
            {'name': 'Apple Juice', 'price': 90, 'category': 'Beverages', 'emoji': '🍎', 'rating': 4.5, 'reviewsCount': 78, 'stock': 22, 'discountPercent': 15, 'description': 'Clear and refreshing apple juice.'},
            {'name': 'Cranberry Juice', 'price': 150, 'category': 'Beverages', 'emoji': '🥤', 'rating': 4.4, 'reviewsCount': 52, 'stock': 15, 'discountPercent': 0, 'description': 'Tart and refreshing cranberry juice.'},
            {'name': 'Green Tea', 'price': 180, 'category': 'Beverages', 'emoji': '🍵', 'rating': 4.7, 'reviewsCount': 145, 'stock': 30, 'discountPercent': 20, 'description': 'Healthy green tea leaves.'},
            {'name': 'Energy Drink', 'price': 120, 'category': 'Beverages', 'emoji': '⚡', 'rating': 4.1, 'reviewsCount': 63, 'stock': 40, 'discountPercent': 25, 'description': 'Instant energy boost.'},
            {'name': 'Coconut Water', 'price': 60, 'category': 'Beverages', 'emoji': '🥥', 'rating': 4.9, 'reviewsCount': 112, 'stock': 50, 'discountPercent': 12, 'description': 'Natural coconut water.'},
            {'name': 'Smoothie', 'price': 150, 'category': 'Beverages', 'emoji': '🥤', 'rating': 4.8, 'reviewsCount': 89, 'stock': 12, 'discountPercent': 20, 'description': 'Delicious mixed fruit smoothie.'},
            {'name': 'Milkshake', 'price': 120, 'category': 'Beverages', 'emoji': '🥤', 'rating': 4.7, 'reviewsCount': 134, 'stock': 15, 'discountPercent': 18, 'description': 'Thick and creamy chocolate milkshake.'},
            {'name': 'Lemonade', 'price': 40, 'category': 'Beverages', 'emoji': '🍋', 'rating': 4.3, 'reviewsCount': 72, 'stock': 45, 'discountPercent': 15, 'description': 'Zesty and refreshing lemonade.'},
            {'name': 'Hot Chocolate', 'price': 100, 'category': 'Beverages', 'emoji': '☕', 'rating': 4.6, 'reviewsCount': 121, 'stock': 20, 'discountPercent': 10, 'description': 'Rich and comforting hot chocolate.'},
        ]
        
        # Create products
        created_products = 0
        for prod_data in products_data:
            category = categories[prod_data['category']]
            product, created = Product.objects.get_or_create(
                name=prod_data['name'],
                category=category,
                defaults={
                    'emoji': prod_data['emoji'],
                    'price': Decimal(str(prod_data['price'])),
                    'rating': Decimal(str(prod_data['rating'])),
                    'reviews_count': prod_data['reviewsCount'],
                    'stock': prod_data['stock'],
                    'discount_percent': prod_data['discountPercent'],
                    'description': prod_data['description'],
                }
            )
            if created:
                created_products += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_products} products'))
        
        # Create coupons
        coupons_data = [
            {
                'code': 'SAVE20',
                'description': '20% off orders above ₹500',
                'coupon_type': 'percentage',
                'value': 20,
                'min_order_value': 500,
                'max_discount': 100,
            },
            {
                'code': 'FRESH15',
                'description': '15% off on fruits & vegetables',
                'coupon_type': 'category',
                'value': 15,
                'applicable_categories': ['Fruits', 'Vegetables'],
                'min_order_value': 200,
                'max_discount': 75,
            },
            {
                'code': 'WELCOME50',
                'description': '₹50 off first order',
                'coupon_type': 'fixed',
                'value': 50,
                'min_order_value': 300,
                'max_discount': 50,
                'first_order_only': True,
            },
            {
                'code': 'DAIRY10',
                'description': '10% off on dairy products',
                'coupon_type': 'category',
                'value': 10,
                'applicable_categories': ['Dairy'],
                'min_order_value': 150,
                'max_discount': 50,
            },
            {
                'code': 'SNACKS25',
                'description': '₹25 off snacks orders',
                'coupon_type': 'fixed',
                'value': 25,
                'applicable_categories': ['Snacks'],
                'min_order_value': 100,
                'max_discount': 25,
            },
        ]
        
        created_coupons = 0
        for coupon_data in coupons_data:
            coupon, created = Coupon.objects.get_or_create(
                code=coupon_data['code'],
                defaults={
                    'description': coupon_data['description'],
                    'coupon_type': coupon_data['coupon_type'],
                    'value': Decimal(str(coupon_data['value'])),
                    'min_order_value': Decimal(str(coupon_data['min_order_value'])),
                    'max_discount': Decimal(str(coupon_data['max_discount'])),
                    'applicable_categories': coupon_data.get('applicable_categories', []),
                    'first_order_only': coupon_data.get('first_order_only', False),
                    'valid_until': timezone.now() + timedelta(days=365),
                }
            )
            if created:
                created_coupons += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_coupons} coupons'))
        self.stdout.write(self.style.SUCCESS('Database seeding completed!'))