#!/usr/bin/env python
"""
Script to seed the database with all 74 products and 5 categories.
Run with: python seed_data.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'happy_groceries.settings')
django.setup()

from products.models import Category, Product
from coupons.models import Coupon
from datetime import date, timedelta


def create_categories():
    """Create the 5 categories."""
    categories_data = [
        {'name': 'Fruits', 'emoji': '🍎', 'color': '#FFB3D9'},
        {'name': 'Vegetables', 'emoji': '🥕', 'color': '#C8E6C9'},
        {'name': 'Dairy', 'emoji': '🥛', 'color': '#B3E5FC'},
        {'name': 'Snacks', 'emoji': '🍪', 'color': '#FFECB3'},
        {'name': 'Beverages', 'emoji': '🧃', 'color': '#FFD9B3'},
    ]
    
    categories = {}
    for data in categories_data:
        category, created = Category.objects.get_or_create(
            name=data['name'],
            defaults={'emoji': data['emoji'], 'color': data['color']}
        )
        categories[data['name']] = category
        action = 'Created' if created else 'Already exists'
        print(f"{action}: {category.name}")
    
    return categories


def create_products(categories):
    """Create all 74 products."""
    products_data = [
        # Fruits (id 1-14)
        {'id': 1, 'name': 'Apple', 'price': 50, 'category': 'Fruits', 'emoji': '🍎', 'rating': 4.5, 'reviews_count': 128, 'stock': 25, 'discount_percent': 15, 'description': 'Crisp, juicy apples packed with fiber and natural sweetness. Perfect for snacking, salads, and fresh juice.'},
        {'id': 2, 'name': 'Banana', 'price': 30, 'category': 'Fruits', 'emoji': '🍌', 'rating': 4.2, 'reviews_count': 94, 'stock': 40, 'discount_percent': 20, 'description': 'Naturally sweet bananas rich in potassium. Great for smoothies, breakfast bowls, and quick energy.'},
        {'id': 3, 'name': 'Orange', 'price': 40, 'category': 'Fruits', 'emoji': '🍊', 'rating': 4.3, 'reviews_count': 76, 'stock': 30, 'discount_percent': 18, 'description': 'Fresh oranges bursting with vitamin C. Enjoy as a snack or squeeze for a refreshing juice.'},
        {'id': 4, 'name': 'Grapes', 'price': 80, 'category': 'Fruits', 'emoji': '🍇', 'rating': 4.6, 'reviews_count': 62, 'stock': 18, 'discount_percent': 25, 'description': 'Sweet, seedless grapes that are perfect for snacking and fruit platters. Chill for extra freshness.'},
        {'id': 5, 'name': 'Strawberry', 'price': 120, 'category': 'Fruits', 'emoji': '🍓', 'rating': 4.8, 'reviews_count': 141, 'stock': 10, 'discount_percent': 30, 'description': 'Bright, fragrant strawberries with a sweet-tart taste. Best for desserts, toppings, and smoothies.'},
        {'id': 6, 'name': 'Watermelon', 'price': 60, 'category': 'Fruits', 'emoji': '🍉', 'rating': 4.4, 'reviews_count': 58, 'stock': 12, 'discount_percent': 12, 'description': 'Refreshing watermelon with a high water content—great for summer hydration and fruit salads.'},
        {'id': 25, 'name': 'Mango', 'price': 100, 'category': 'Fruits', 'emoji': '🥭', 'rating': 4.7, 'reviews_count': 115, 'stock': 20, 'discount_percent': 25, 'description': 'Sweet and juicy Alphonso mangoes, known as the king of fruits.'},
        {'id': 26, 'name': 'Pineapple', 'price': 80, 'category': 'Fruits', 'emoji': '🍍', 'rating': 4.5, 'reviews_count': 82, 'stock': 15, 'discount_percent': 20, 'description': 'Tropical pineapples with a sweet and tangy flavor. Great for desserts and juices.'},
        {'id': 27, 'name': 'Kiwi', 'price': 120, 'category': 'Fruits', 'emoji': '🥝', 'rating': 4.6, 'reviews_count': 64, 'stock': 25, 'discount_percent': 0, 'description': 'Tangy and vitamin-rich kiwis with a unique flavor and vibrant green flesh.'},
        {'id': 28, 'name': 'Papaya', 'price': 50, 'category': 'Fruits', 'emoji': '🍈', 'rating': 4.2, 'reviews_count': 45, 'stock': 18, 'discount_percent': 18, 'description': 'Ripe and sweet papayas, perfect for a healthy breakfast or snack.'},
        {'id': 29, 'name': 'Guava', 'price': 40, 'category': 'Fruits', 'emoji': '🍈', 'rating': 4.1, 'reviews_count': 38, 'stock': 30, 'discount_percent': 22, 'description': 'Fresh pink guavas, crunchy and full of vitamin C. Great with a pinch of salt and chili.'},
        {'id': 30, 'name': 'Pomegranate', 'price': 150, 'category': 'Fruits', 'emoji': '🍎', 'rating': 4.8, 'reviews_count': 92, 'stock': 12, 'discount_percent': 0, 'description': 'Juicy red pomegranate pearls, packed with antioxidants and sweet-tart flavor.'},
        {'id': 31, 'name': 'Blueberry', 'price': 300, 'category': 'Fruits', 'emoji': '🫐', 'rating': 4.9, 'reviews_count': 156, 'stock': 10, 'discount_percent': 0, 'description': 'Premium fresh blueberries, perfect for smoothies, pancakes, or healthy snacking.'},
        {'id': 32, 'name': 'Peach', 'price': 180, 'category': 'Fruits', 'emoji': '🍑', 'rating': 4.4, 'reviews_count': 53, 'stock': 14, 'discount_percent': 0, 'description': 'Soft and sweet peaches with a delicate aroma. Ideal for desserts and salads.'},
        {'id': 33, 'name': 'Cherry', 'price': 250, 'category': 'Fruits', 'emoji': '🍒', 'rating': 4.7, 'reviews_count': 124, 'stock': 8, 'discount_percent': 0, 'description': 'Sweet red cherries, a perfect seasonal treat for snacking or baking.'},
        {'id': 34, 'name': 'Avocado', 'price': 200, 'category': 'Fruits', 'emoji': '🥑', 'rating': 4.3, 'reviews_count': 89, 'stock': 12, 'discount_percent': 0, 'description': 'Creamy ripe avocados, perfect for toast, salads, and healthy fats.'},

        # Vegetables (id 7-12, 35-44)
        {'id': 7, 'name': 'Carrot', 'price': 30, 'category': 'Vegetables', 'emoji': '🥕', 'rating': 4.0, 'reviews_count': 44, 'stock': 35, 'discount_percent': 20, 'description': 'Crunchy carrots rich in beta-carotene. Ideal for salads, soups, and healthy snacking.'},
        {'id': 8, 'name': 'Tomato', 'price': 25, 'category': 'Vegetables', 'emoji': '🍅', 'rating': 4.1, 'reviews_count': 52, 'stock': 28, 'discount_percent': 15, 'description': 'Juicy tomatoes that add flavor to curries, sandwiches, and salads. A kitchen staple!'},
        {'id': 9, 'name': 'Broccoli', 'price': 45, 'category': 'Vegetables', 'emoji': '🥦', 'rating': 4.2, 'reviews_count': 39, 'stock': 16, 'discount_percent': 18, 'description': 'Fresh broccoli florets loaded with nutrients. Steam, stir-fry, or roast for a delicious side.'},
        {'id': 10, 'name': 'Cucumber', 'price': 35, 'category': 'Vegetables', 'emoji': '🥒', 'rating': 3.9, 'reviews_count': 31, 'stock': 22, 'discount_percent': 22, 'description': 'Cool and crisp cucumbers—perfect for salads, raita, and refreshing hydration.'},
        {'id': 11, 'name': 'Potato', 'price': 20, 'category': 'Vegetables', 'emoji': '🥔', 'rating': 4.0, 'reviews_count': 67, 'stock': 50, 'discount_percent': 10, 'description': 'Versatile potatoes for curries, fries, and snacks. A must-have for everyday cooking.'},
        {'id': 12, 'name': 'Corn', 'price': 40, 'category': 'Vegetables', 'emoji': '🌽', 'rating': 4.3, 'reviews_count': 46, 'stock': 20, 'discount_percent': 16, 'description': 'Sweet corn that\'s great boiled, grilled, or tossed into soups and salads for extra crunch.'},
        {'id': 35, 'name': 'Spinach', 'price': 30, 'category': 'Vegetables', 'emoji': '🥬', 'rating': 4.5, 'reviews_count': 78, 'stock': 40, 'discount_percent': 15, 'description': 'Fresh green spinach leaves, nutrient-dense and versatile for cooking.'},
        {'id': 36, 'name': 'Cauliflower', 'price': 50, 'category': 'Vegetables', 'emoji': '🥦', 'rating': 4.1, 'reviews_count': 42, 'stock': 22, 'discount_percent': 18, 'description': 'Fresh white cauliflower florets, great for curries, roasting, or stir-frying.'},
        {'id': 37, 'name': 'Cabbage', 'price': 40, 'category': 'Vegetables', 'emoji': '🥬', 'rating': 4.0, 'reviews_count': 35, 'stock': 25, 'discount_percent': 20, 'description': 'Crunchy green cabbage, perfect for salads, slaws, and stir-fries.'},
        {'id': 38, 'name': 'Onion', 'price': 45, 'category': 'Vegetables', 'emoji': '🧅', 'rating': 4.2, 'reviews_count': 160, 'stock': 100, 'discount_percent': 10, 'description': 'Essential red onions for every kitchen. Adds flavor and crunch to any dish.'},
        {'id': 39, 'name': 'Garlic', 'price': 20, 'category': 'Vegetables', 'emoji': '🧄', 'rating': 4.6, 'reviews_count': 95, 'stock': 60, 'discount_percent': 12, 'description': 'Pungent and flavorful garlic cloves, a must-have for seasoning and health.'},
        {'id': 40, 'name': 'Bell Pepper', 'price': 80, 'category': 'Vegetables', 'emoji': '🫑', 'rating': 4.4, 'reviews_count': 67, 'stock': 15, 'discount_percent': 15, 'description': 'Vibrant and crunchy bell peppers, perfect for stir-fries, salads, and stuffing.'},
        {'id': 41, 'name': 'Sweet Potato', 'price': 60, 'category': 'Vegetables', 'emoji': '🍠', 'rating': 4.3, 'reviews_count': 48, 'stock': 30, 'discount_percent': 18, 'description': 'Nutritious sweet potatoes, great for roasting, mashing, or as a healthy snack.'},
        {'id': 42, 'name': 'Peas', 'price': 70, 'category': 'Vegetables', 'emoji': '🫛', 'rating': 4.5, 'reviews_count': 52, 'stock': 20, 'discount_percent': 20, 'description': 'Fresh green peas, sweet and tender. Ideal for curries, pulao, and side dishes.'},
        {'id': 43, 'name': 'Beans', 'price': 50, 'category': 'Vegetables', 'emoji': '🫛', 'rating': 4.2, 'reviews_count': 41, 'stock': 25, 'discount_percent': 16, 'description': 'Fresh green beans, crunchy and nutritious. Great for stir-frying and steaming.'},
        {'id': 44, 'name': 'Mushrooms', 'price': 90, 'category': 'Vegetables', 'emoji': '🍄', 'rating': 4.7, 'reviews_count': 84, 'stock': 12, 'discount_percent': 0, 'description': 'Fresh button mushrooms, earthy and savory. Perfect for pasta, pizzas, and stir-fries.'},

        # Dairy (id 13-16, 45-54)
        {'id': 13, 'name': 'Milk', 'price': 55, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.5, 'reviews_count': 110, 'stock': 24, 'discount_percent': 10, 'description': 'Fresh, creamy milk—perfect for tea, coffee, cereals, and everyday nutrition.'},
        {'id': 14, 'name': 'Cheese', 'price': 150, 'category': 'Dairy', 'emoji': '🧀', 'rating': 4.7, 'reviews_count': 88, 'stock': 14, 'discount_percent': 15, 'description': 'Rich and flavorful cheese that melts beautifully. Great for sandwiches, pasta, and snacks.'},
        {'id': 15, 'name': 'Butter', 'price': 180, 'category': 'Dairy', 'emoji': '🧈', 'rating': 4.6, 'reviews_count': 73, 'stock': 9, 'discount_percent': 8, 'description': 'Creamy butter for spreading, baking, and cooking. Adds a delicious richness to any dish.'},
        {'id': 16, 'name': 'Yogurt', 'price': 60, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.4, 'reviews_count': 66, 'stock': 18, 'discount_percent': 12, 'description': 'Smooth yogurt that\'s great for breakfast, smoothies, and homemade raita.'},
        {'id': 45, 'name': 'Paneer', 'price': 120, 'category': 'Dairy', 'emoji': '🧀', 'rating': 4.8, 'reviews_count': 142, 'stock': 18, 'discount_percent': 12, 'description': 'Fresh and soft cottage cheese (paneer), a versatile protein for Indian dishes.'},
        {'id': 46, 'name': 'Ghee', 'price': 600, 'category': 'Dairy', 'emoji': '🧈', 'rating': 4.9, 'reviews_count': 215, 'stock': 15, 'discount_percent': 10, 'description': 'Pure cow ghee, aromatic and rich. Perfect for cooking and adding flavor to meals.'},
        {'id': 47, 'name': 'Ice Cream', 'price': 250, 'category': 'Dairy', 'emoji': '🍦', 'rating': 4.7, 'reviews_count': 188, 'stock': 10, 'discount_percent': 15, 'description': 'Creamy vanilla ice cream, the perfect dessert to satisfy your sweet cravings.'},
        {'id': 48, 'name': 'Buttermilk', 'price': 30, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.2, 'reviews_count': 63, 'stock': 40, 'discount_percent': 8, 'description': 'Refreshing and cooling buttermilk, great for digestion and summer heat.'},
        {'id': 49, 'name': 'Flavored Yogurt', 'price': 80, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.5, 'reviews_count': 76, 'stock': 25, 'discount_percent': 12, 'description': 'Delicious fruit-flavored yogurt, a healthy and tasty snack for any time.'},
        {'id': 50, 'name': 'Whipped Cream', 'price': 150, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.3, 'reviews_count': 45, 'stock': 12, 'discount_percent': 0, 'description': 'Light and fluffy whipped cream, perfect for topping desserts and fruits.'},
        {'id': 51, 'name': 'Sour Cream', 'price': 120, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.1, 'reviews_count': 32, 'stock': 15, 'discount_percent': 0, 'description': 'Thick and tangy sour cream, ideal for dips, baked potatoes, and tacos.'},
        {'id': 52, 'name': 'Condensed Milk', 'price': 180, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.6, 'reviews_count': 87, 'stock': 20, 'discount_percent': 10, 'description': 'Sweetened condensed milk, a key ingredient for many delicious desserts.'},
        {'id': 53, 'name': 'Soya Milk', 'price': 90, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.0, 'reviews_count': 42, 'stock': 18, 'discount_percent': 15, 'description': 'Nutritious plant-based soya milk, a great dairy alternative for health-conscious users.'},
        {'id': 54, 'name': 'Almond Milk', 'price': 250, 'category': 'Dairy', 'emoji': '🥛', 'rating': 4.4, 'reviews_count': 59, 'stock': 14, 'discount_percent': 0, 'description': 'Creamy almond milk, a delicious and healthy non-dairy milk alternative.'},

        # Snacks (id 17-20, 55-64)
        {'id': 17, 'name': 'Cookies', 'price': 80, 'category': 'Snacks', 'emoji': '🍪', 'rating': 4.8, 'reviews_count': 152, 'stock': 32, 'discount_percent': 25, 'description': 'Crunchy cookies with a delightful sweetness—perfect with tea, coffee, or as a quick treat.'},
        {'id': 18, 'name': 'Chips', 'price': 50, 'category': 'Snacks', 'emoji': '🥔', 'rating': 4.5, 'reviews_count': 97, 'stock': 45, 'discount_percent': 20, 'description': 'Crispy, salty chips for movie nights and snack cravings. Enjoy the crunch!'},
        {'id': 19, 'name': 'Chocolate', 'price': 100, 'category': 'Snacks', 'emoji': '🍫', 'rating': 4.9, 'reviews_count': 210, 'stock': 27, 'discount_percent': 30, 'description': 'Smooth, indulgent chocolate to satisfy your sweet tooth. Great for gifting and desserts.'},
        {'id': 20, 'name': 'Popcorn', 'price': 70, 'category': 'Snacks', 'emoji': '🍿', 'rating': 4.3, 'reviews_count': 54, 'stock': 38, 'discount_percent': 35, 'description': 'Light and fluffy popcorn—perfect for binge-watching and quick snacking.'},
        {'id': 55, 'name': 'Almonds', 'price': 400, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.8, 'reviews_count': 134, 'stock': 30, 'discount_percent': 15, 'description': 'Premium roasted almonds, a crunchy and nutritious snack packed with vitamin E.'},
        {'id': 56, 'name': 'Cashews', 'price': 500, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.9, 'reviews_count': 122, 'stock': 25, 'discount_percent': 18, 'description': 'Creamy and delicious cashew nuts, perfect for snacking or adding to desserts.'},
        {'id': 57, 'name': 'Walnuts', 'price': 600, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.7, 'reviews_count': 88, 'stock': 20, 'discount_percent': 20, 'description': 'Healthy walnuts, rich in omega-3 fatty acids. Great for brain health and snacking.'},
        {'id': 58, 'name': 'Raisins', 'price': 150, 'category': 'Snacks', 'emoji': '🍇', 'rating': 4.5, 'reviews_count': 67, 'stock': 35, 'discount_percent': 22, 'description': 'Sweet and chewy raisins, a natural energy booster for your day.'},
        {'id': 59, 'name': 'Granola', 'price': 250, 'category': 'Snacks', 'emoji': '🥣', 'rating': 4.4, 'reviews_count': 91, 'stock': 15, 'discount_percent': 25, 'description': 'Crunchy granola with nuts and honey, perfect for a healthy breakfast or snack.'},
        {'id': 60, 'name': 'Trail Mix', 'price': 300, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.6, 'reviews_count': 73, 'stock': 20, 'discount_percent': 20, 'description': 'A mix of nuts, seeds, and dried fruits for sustained energy on the go.'},
        {'id': 61, 'name': 'Pretzels', 'price': 100, 'category': 'Snacks', 'emoji': '🥨', 'rating': 4.2, 'reviews_count': 54, 'stock': 40, 'discount_percent': 30, 'description': 'Classic salted pretzels, a crunchy and satisfying snack for any time.'},
        {'id': 62, 'name': 'Nachos', 'price': 90, 'category': 'Snacks', 'emoji': '🌮', 'rating': 4.3, 'reviews_count': 86, 'stock': 30, 'discount_percent': 25, 'description': 'Crispy corn nachos, perfect with cheese dip or salsa for movie nights.'},
        {'id': 63, 'name': 'Peanuts', 'price': 60, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.1, 'reviews_count': 102, 'stock': 50, 'discount_percent': 15, 'description': 'Roasted and salted peanuts, a classic and affordable high-protein snack.'},
        {'id': 64, 'name': 'Pistachios', 'price': 700, 'category': 'Snacks', 'emoji': '🥜', 'rating': 4.8, 'reviews_count': 115, 'stock': 18, 'discount_percent': 0, 'description': 'Delicious roasted pistachios, fun to crack and full of nutrients.'},

        # Beverages (id 21-24, 65-74)
        {'id': 21, 'name': 'Orange Juice', 'price': 90, 'category': 'Beverages', 'emoji': '🧃', 'rating': 4.4, 'reviews_count': 61, 'stock': 20, 'discount_percent': 15, 'description': 'Refreshing orange juice with a citrusy punch. Serve chilled for the best taste.'},
        {'id': 22, 'name': 'Coffee', 'price': 200, 'category': 'Beverages', 'emoji': '☕', 'rating': 4.7, 'reviews_count': 139, 'stock': 15, 'discount_percent': 20, 'description': 'Aromatic coffee to kickstart your day. Enjoy hot, iced, or with your favorite milk.'},
        {'id': 23, 'name': 'Tea', 'price': 120, 'category': 'Beverages', 'emoji': '🍵', 'rating': 4.5, 'reviews_count': 103, 'stock': 22, 'discount_percent': 18, 'description': 'Comforting tea for every mood. Brew strong or light—your perfect cup awaits.'},
        {'id': 24, 'name': 'Soda', 'price': 40, 'category': 'Beverages', 'emoji': '🥤', 'rating': 3.8, 'reviews_count': 29, 'stock': 0, 'discount_percent': 0, 'description': 'Classic fizzy soda—cool and refreshing. Best served chilled with ice.'},
        {'id': 65, 'name': 'Mango Juice', 'price': 80, 'category': 'Beverages', 'emoji': '🥭', 'rating': 4.6, 'reviews_count': 94, 'stock': 25, 'discount_percent': 18, 'description': 'Sweet and thick mango nectar, made from the finest ripe mangoes.'},
        {'id': 66, 'name': 'Apple Juice', 'price': 90, 'category': 'Beverages', 'emoji': '🍎', 'rating': 4.5, 'reviews_count': 78, 'stock': 22, 'discount_percent': 15, 'description': 'Clear and refreshing apple juice, naturally sweet and full of flavor.'},
        {'id': 67, 'name': 'Cranberry Juice', 'price': 150, 'category': 'Beverages', 'emoji': '🥤', 'rating': 4.4, 'reviews_count': 52, 'stock': 15, 'discount_percent': 0, 'description': 'Tart and refreshing cranberry juice, great on its own or as a mixer.'},
        {'id': 68, 'name': 'Green Tea', 'price': 180, 'category': 'Beverages', 'emoji': '🍵', 'rating': 4.7, 'reviews_count': 145, 'stock': 30, 'discount_percent': 20, 'description': 'Healthy green tea leaves, rich in antioxidants for a revitalizing break.'},
        {'id': 69, 'name': 'Energy Drink', 'price': 120, 'category': 'Beverages', 'emoji': '⚡', 'rating': 4.1, 'reviews_count': 63, 'stock': 40, 'discount_percent': 25, 'description': 'Instant energy boost to keep you going through your busy day.'},
        {'id': 70, 'name': 'Coconut Water', 'price': 60, 'category': 'Beverages', 'emoji': '🥥', 'rating': 4.9, 'reviews_count': 112, 'stock': 50, 'discount_percent': 12, 'description': 'Natural and refreshing coconut water, perfect for hydration and electrolytes.'},
        {'id': 71, 'name': 'Smoothie', 'price': 150, 'category': 'Beverages', 'emoji': '🥤', 'rating': 4.8, 'reviews_count': 89, 'stock': 12, 'discount_percent': 20, 'description': 'Delicious mixed fruit smoothie, a healthy and filling drink for any time.'},
        {'id': 72, 'name': 'Milkshake', 'price': 120, 'category': 'Beverages', 'emoji': '🥤', 'rating': 4.7, 'reviews_count': 134, 'stock': 15, 'discount_percent': 18, 'description': 'Thick and creamy chocolate milkshake, a classic treat for all ages.'},
        {'id': 73, 'name': 'Lemonade', 'price': 40, 'category': 'Beverages', 'emoji': '🍋', 'rating': 4.3, 'reviews_count': 72, 'stock': 45, 'discount_percent': 15, 'description': 'Zesty and refreshing lemonade, the perfect thirst quencher on a hot day.'},
        {'id': 74, 'name': 'Hot Chocolate', 'price': 100, 'category': 'Beverages', 'emoji': '☕', 'rating': 4.6, 'reviews_count': 121, 'stock': 20, 'discount_percent': 10, 'description': 'Rich and comforting hot chocolate, perfect for cozy evenings.'},
    ]
    
    created_count = 0
    for data in products_data:
        category = categories.get(data['category'])
        if not category:
            print(f"Warning: Category {data['category']} not found for {data['name']}")
            continue
        
        product, created = Product.objects.get_or_create(
            id=data['id'],
            defaults={
                'name': data['name'],
                'price': data['price'],
                'category': category,
                'emoji': data['emoji'],
                'rating': data['rating'],
                'reviews_count': data['reviews_count'],
                'stock': data['stock'],
                'discount_percent': data['discount_percent'],
                'description': data['description'],
                'is_active': True
            }
        )
        
        if created:
            created_count += 1
            print(f"Created: {product.name} ({product.category.name})")
        else:
            print(f"Already exists: {product.name}")
    
    print(f"\nTotal products created: {created_count}")
    return created_count


def create_coupons():
    """Create the 5 coupons."""
    expiry = date.today() + timedelta(days=365*3)  # 3 years from now
    
    coupons_data = [
        {
            'code': 'SAVE20',
            'description': '20% off orders above ₹500',
            'type': 'percentage',
            'value': 20,
            'min_order_value': 500,
            'max_discount': 100,
            'applicable_categories': '',
            'first_order_only': False,
        },
        {
            'code': 'FRESH15',
            'description': '15% off on fruits & vegetables',
            'type': 'category',
            'value': 15,
            'min_order_value': 200,
            'max_discount': 75,
            'applicable_categories': 'Fruits,Vegetables',
            'first_order_only': False,
        },
        {
            'code': 'WELCOME50',
            'description': '₹50 off first order',
            'type': 'fixed',
            'value': 50,
            'min_order_value': 300,
            'max_discount': 50,
            'applicable_categories': '',
            'first_order_only': True,
        },
        {
            'code': 'DAIRY10',
            'description': '10% off on dairy products',
            'type': 'category',
            'value': 10,
            'min_order_value': 150,
            'max_discount': 50,
            'applicable_categories': 'Dairy',
            'first_order_only': False,
        },
        {
            'code': 'SNACKS25',
            'description': '₹25 off snacks orders',
            'type': 'fixed',
            'value': 25,
            'min_order_value': 100,
            'max_discount': 25,
            'applicable_categories': 'Snacks',
            'first_order_only': False,
        },
    ]
    
    created_count = 0
    for data in coupons_data:
        coupon, created = Coupon.objects.get_or_create(
            code=data['code'],
            defaults={
                'description': data['description'],
                'type': data['type'],
                'value': data['value'],
                'min_order_value': data['min_order_value'],
                'max_discount': data['max_discount'],
                'applicable_categories': data['applicable_categories'],
                'first_order_only': data['first_order_only'],
                'expiry_date': expiry,
                'active': True
            }
        )
        
        if created:
            created_count += 1
            print(f"Created coupon: {coupon.code}")
        else:
            print(f"Already exists: {coupon.code}")
    
    print(f"\nTotal coupons created: {created_count}")
    return created_count


def main():
    print("=" * 60)
    print("Happy Groceries - Database Seeding")
    print("=" * 60)
    
    # Create categories
    print("\n--- Creating Categories ---")
    categories = create_categories()
    
    # Create products
    print("\n--- Creating Products ---")
    create_products(categories)
    
    # Create coupons
    print("\n--- Creating Coupons ---")
    create_coupons()
    
    print("\n" + "=" * 60)
    print("Seeding complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
