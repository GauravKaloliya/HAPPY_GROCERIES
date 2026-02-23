-- Happy Groceries Seed Data
-- This file contains all seed data matching the legacy system
-- Run this after schema.sql to populate the database

-- =====================================================
-- CATEGORIES (5 categories from legacy system)
-- =====================================================

INSERT INTO categories (name, description, emoji, color, created_at) VALUES
    ('Fruits', 'Fresh fruits from local farms', '🍎', 'var(--primary-pink)', NOW()),
    ('Vegetables', 'Fresh vegetables for a healthy diet', '🥕', 'var(--primary-green)', NOW()),
    ('Dairy', 'Dairy products including milk, cheese, and more', '🥛', 'var(--primary-blue)', NOW()),
    ('Snacks', 'Delicious snacks for every mood', '🍪', 'var(--primary-orange)', NOW()),
    ('Beverages', 'Refreshing drinks and beverages', '🧃', 'var(--primary-purple)', NOW())
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PRODUCTS (74 products from legacy system with exact match)
-- =====================================================

-- FRUITS (16 products)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description, is_active, created_at, updated_at)
VALUES
    (1, 'Apple', 50.00, 1, '🍎', 4.5, 128, 25, 15, 'Crisp, juicy apples packed with fiber and natural sweetness. Perfect for snacking, salads, and fresh juice.', TRUE, NOW(), NOW()),
    (2, 'Banana', 30.00, 1, '🍌', 4.2, 94, 40, 20, 'Naturally sweet bananas rich in potassium. Great for smoothies, breakfast bowls, and quick energy.', TRUE, NOW(), NOW()),
    (3, 'Orange', 40.00, 1, '🍊', 4.3, 76, 30, 18, 'Fresh oranges bursting with vitamin C. Enjoy as a snack or squeeze for a refreshing juice.', TRUE, NOW(), NOW()),
    (4, 'Grapes', 80.00, 1, '🍇', 4.6, 62, 18, 25, 'Sweet, seedless grapes that are perfect for snacking and fruit platters. Chill for extra freshness.', TRUE, NOW(), NOW()),
    (5, 'Strawberry', 120.00, 1, '🍓', 4.8, 141, 10, 30, 'Bright, fragrant strawberries with a sweet-tart taste. Best for desserts, toppings, and smoothies.', TRUE, NOW(), NOW()),
    (6, 'Watermelon', 60.00, 1, '🍉', 4.4, 58, 12, 12, 'Refreshing watermelon with a high water content—great for summer hydration and fruit salads.', TRUE, NOW(), NOW()),
    (25, 'Mango', 100.00, 1, '🥭', 4.7, 115, 20, 25, 'Sweet and juicy Alphonso mangoes, known as the king of fruits.', TRUE, NOW(), NOW()),
    (26, 'Pineapple', 80.00, 1, '🍍', 4.5, 82, 15, 20, 'Tropical pineapples with a sweet and tangy flavor. Great for desserts and juices.', TRUE, NOW(), NOW()),
    (27, 'Kiwi', 120.00, 1, '🥝', 4.6, 64, 25, 0, 'Tangy and vitamin-rich kiwis with a unique flavor and vibrant green flesh.', TRUE, NOW(), NOW()),
    (28, 'Papaya', 50.00, 1, '🍈', 4.2, 45, 18, 18, 'Ripe and sweet papayas, perfect for a healthy breakfast or snack.', TRUE, NOW(), NOW()),
    (29, 'Guava', 40.00, 1, '🍈', 4.1, 38, 30, 22, 'Fresh pink guavas, crunchy and full of vitamin C. Great with a pinch of salt and chili.', TRUE, NOW(), NOW()),
    (30, 'Pomegranate', 150.00, 1, '🍎', 4.8, 92, 12, 0, 'Juicy red pomegranate pearls, packed with antioxidants and sweet-tart flavor.', TRUE, NOW(), NOW()),
    (31, 'Blueberry', 300.00, 1, '🫐', 4.9, 156, 10, 0, 'Premium fresh blueberries, perfect for smoothies, pancakes, or healthy snacking.', TRUE, NOW(), NOW()),
    (32, 'Peach', 180.00, 1, '🍑', 4.4, 53, 14, 0, 'Soft and sweet peaches with a delicate aroma. Ideal for desserts and salads.', TRUE, NOW(), NOW()),
    (33, 'Cherry', 250.00, 1, '🍒', 4.7, 124, 8, 0, 'Sweet red cherries, a perfect seasonal treat for snacking or baking.', TRUE, NOW(), NOW()),
    (34, 'Avocado', 200.00, 1, '🥑', 4.3, 89, 12, 0, 'Creamy ripe avocados, perfect for toast, salads, and healthy fats.', TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- VEGETABLES (16 products)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description, is_active, created_at, updated_at)
VALUES
    (7, 'Carrot', 30.00, 2, '🥕', 4.0, 44, 35, 20, 'Crunchy carrots rich in beta-carotene. Ideal for salads, soups, and healthy snacking.', TRUE, NOW(), NOW()),
    (8, 'Tomato', 25.00, 2, '🍅', 4.1, 52, 28, 15, 'Juicy tomatoes that add flavor to curries, sandwiches, and salads. A kitchen staple!', TRUE, NOW(), NOW()),
    (9, 'Broccoli', 45.00, 2, '🥦', 4.2, 39, 16, 18, 'Fresh broccoli florets loaded with nutrients. Steam, stir-fry, or roast for a delicious side.', TRUE, NOW(), NOW()),
    (10, 'Cucumber', 35.00, 2, '🥒', 3.9, 31, 22, 22, 'Cool and crisp cucumbers—perfect for salads, raita, and refreshing hydration.', TRUE, NOW(), NOW()),
    (11, 'Potato', 20.00, 2, '🥔', 4.0, 67, 50, 10, 'Versatile potatoes for curries, fries, and snacks. A must-have for everyday cooking.', TRUE, NOW(), NOW()),
    (12, 'Corn', 40.00, 2, '🌽', 4.3, 46, 20, 16, 'Sweet corn that''s great boiled, grilled, or tossed into soups and salads for extra crunch.', TRUE, NOW(), NOW()),
    (35, 'Spinach', 30.00, 2, '🥬', 4.5, 78, 40, 15, 'Fresh green spinach leaves, nutrient-dense and versatile for cooking.', TRUE, NOW(), NOW()),
    (36, 'Cauliflower', 50.00, 2, '🥦', 4.1, 42, 22, 18, 'Fresh white cauliflower florets, great for curries, roasting, or stir-frying.', TRUE, NOW(), NOW()),
    (37, 'Cabbage', 40.00, 2, '🥬', 4.0, 35, 25, 20, 'Crunchy green cabbage, perfect for salads, slaws, and stir-fries.', TRUE, NOW(), NOW()),
    (38, 'Onion', 45.00, 2, '🧅', 4.2, 160, 100, 10, 'Essential red onions for every kitchen. Adds flavor and crunch to any dish.', TRUE, NOW(), NOW()),
    (39, 'Garlic', 20.00, 2, '🧄', 4.6, 95, 60, 12, 'Pungent and flavorful garlic cloves, a must-have for seasoning and health.', TRUE, NOW(), NOW()),
    (40, 'Bell Pepper', 80.00, 2, '🫑', 4.4, 67, 15, 15, 'Vibrant and crunchy bell peppers, perfect for stir-fries, salads, and stuffing.', TRUE, NOW(), NOW()),
    (41, 'Sweet Potato', 60.00, 2, '🍠', 4.3, 48, 30, 18, 'Nutritious sweet potatoes, great for roasting, mashing, or as a healthy snack.', TRUE, NOW(), NOW()),
    (42, 'Peas', 70.00, 2, '🫛', 4.5, 52, 20, 20, 'Fresh green peas, sweet and tender. Ideal for curries, pulao, and side dishes.', TRUE, NOW(), NOW()),
    (43, 'Beans', 50.00, 2, '🫛', 4.2, 41, 25, 16, 'Fresh green beans, crunchy and nutritious. Great for stir-frying and steaming.', TRUE, NOW(), NOW()),
    (44, 'Mushrooms', 90.00, 2, '🍄', 4.7, 84, 12, 0, 'Fresh button mushrooms, earthy and savory. Perfect for pasta, pizzas, and stir-fries.', TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- DAIRY (14 products)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description, is_active, created_at, updated_at)
VALUES
    (13, 'Milk', 55.00, 3, '🥛', 4.5, 110, 24, 10, 'Fresh, creamy milk—perfect for tea, coffee, cereals, and everyday nutrition.', TRUE, NOW(), NOW()),
    (14, 'Cheese', 150.00, 3, '🧀', 4.7, 88, 14, 15, 'Rich and flavorful cheese that melts beautifully. Great for sandwiches, pasta, and snacks.', TRUE, NOW(), NOW()),
    (15, 'Butter', 180.00, 3, '🧈', 4.6, 73, 9, 8, 'Creamy butter for spreading, baking, and cooking. Adds a delicious richness to any dish.', TRUE, NOW(), NOW()),
    (16, 'Yogurt', 60.00, 3, '🥛', 4.4, 66, 18, 12, 'Smooth yogurt that''s great for breakfast, smoothies, and homemade raita.', TRUE, NOW(), NOW()),
    (45, 'Paneer', 120.00, 3, '🧀', 4.8, 142, 18, 12, 'Fresh and soft cottage cheese (paneer), a versatile protein for Indian dishes.', TRUE, NOW(), NOW()),
    (46, 'Ghee', 600.00, 3, '🧈', 4.9, 215, 15, 10, 'Pure cow ghee, aromatic and rich. Perfect for cooking and adding flavor to meals.', TRUE, NOW(), NOW()),
    (47, 'Ice Cream', 250.00, 3, '🍦', 4.7, 188, 10, 15, 'Creamy vanilla ice cream, the perfect dessert to satisfy your sweet cravings.', TRUE, NOW(), NOW()),
    (48, 'Buttermilk', 30.00, 3, '🥛', 4.2, 63, 40, 8, 'Refreshing and cooling buttermilk, great for digestion and summer heat.', TRUE, NOW(), NOW()),
    (49, 'Flavored Yogurt', 80.00, 3, '🥛', 4.5, 76, 25, 12, 'Delicious fruit-flavored yogurt, a healthy and tasty snack for any time.', TRUE, NOW(), NOW()),
    (50, 'Whipped Cream', 150.00, 3, '🥛', 4.3, 45, 12, 0, 'Light and fluffy whipped cream, perfect for topping desserts and fruits.', TRUE, NOW(), NOW()),
    (51, 'Sour Cream', 120.00, 3, '🥛', 4.1, 32, 15, 0, 'Thick and tangy sour cream, ideal for dips, baked potatoes, and tacos.', TRUE, NOW(), NOW()),
    (52, 'Condensed Milk', 180.00, 3, '🥛', 4.6, 87, 20, 10, 'Sweetened condensed milk, a key ingredient for many delicious desserts.', TRUE, NOW(), NOW()),
    (53, 'Soya Milk', 90.00, 3, '🥛', 4.0, 42, 18, 15, 'Nutritious plant-based soya milk, a great dairy alternative for health-conscious users.', TRUE, NOW(), NOW()),
    (54, 'Almond Milk', 250.00, 3, '🥛', 4.4, 59, 14, 0, 'Creamy almond milk, a delicious and healthy non-dairy milk alternative.', TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- SNACKS (14 products)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description, is_active, created_at, updated_at)
VALUES
    (17, 'Cookies', 80.00, 4, '🍪', 4.8, 152, 32, 25, 'Crunchy cookies with a delightful sweetness—perfect with tea, coffee, or as a quick treat.', TRUE, NOW(), NOW()),
    (18, 'Chips', 50.00, 4, '🥔', 4.5, 97, 45, 20, 'Crispy, salty chips for movie nights and snack cravings. Enjoy the crunch!', TRUE, NOW(), NOW()),
    (19, 'Chocolate', 100.00, 4, '🍫', 4.9, 210, 27, 30, 'Smooth, indulgent chocolate to satisfy your sweet tooth. Great for gifting and desserts.', TRUE, NOW(), NOW()),
    (20, 'Popcorn', 70.00, 4, '🍿', 4.3, 54, 38, 35, 'Light and fluffy popcorn—perfect for binge-watching and quick snacking.', TRUE, NOW(), NOW()),
    (55, 'Almonds', 400.00, 4, '🥜', 4.8, 134, 30, 15, 'Premium roasted almonds, a crunchy and nutritious snack packed with vitamin E.', TRUE, NOW(), NOW()),
    (56, 'Cashews', 500.00, 4, '🥜', 4.9, 122, 25, 18, 'Creamy and delicious cashew nuts, perfect for snacking or adding to desserts.', TRUE, NOW(), NOW()),
    (57, 'Walnuts', 600.00, 4, '🥜', 4.7, 88, 20, 20, 'Healthy walnuts, rich in omega-3 fatty acids. Great for brain health and snacking.', TRUE, NOW(), NOW()),
    (58, 'Raisins', 150.00, 4, '🍇', 4.5, 67, 35, 22, 'Sweet and chewy raisins, a natural energy booster for your day.', TRUE, NOW(), NOW()),
    (59, 'Granola', 250.00, 4, '🥣', 4.4, 91, 15, 25, 'Crunchy granola with nuts and honey, perfect for a healthy breakfast or snack.', TRUE, NOW(), NOW()),
    (60, 'Trail Mix', 300.00, 4, '🥜', 4.6, 73, 20, 20, 'A mix of nuts, seeds, and dried fruits for sustained energy on the go.', TRUE, NOW(), NOW()),
    (61, 'Pretzels', 100.00, 4, '🥨', 4.2, 54, 40, 30, 'Classic salted pretzels, a crunchy and satisfying snack for any time.', TRUE, NOW(), NOW()),
    (62, 'Nachos', 90.00, 4, '🌮', 4.3, 86, 30, 25, 'Crispy corn nachos, perfect with cheese dip or salsa for movie nights.', TRUE, NOW(), NOW()),
    (63, 'Peanuts', 60.00, 4, '🥜', 4.1, 102, 50, 15, 'Roasted and salted peanuts, a classic and affordable high-protein snack.', TRUE, NOW(), NOW()),
    (64, 'Pistachios', 700.00, 4, '🥜', 4.8, 115, 18, 0, 'Delicious roasted pistachios, fun to crack and full of nutrients.', TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- BEVERAGES (16 products)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description, is_active, created_at, updated_at)
VALUES
    (21, 'Orange Juice', 90.00, 5, '🧃', 4.4, 61, 20, 15, 'Refreshing orange juice with a citrusy punch. Serve chilled for the best taste.', TRUE, NOW(), NOW()),
    (22, 'Coffee', 200.00, 5, '☕', 4.7, 139, 15, 20, 'Aromatic coffee to kickstart your day. Enjoy hot, iced, or with your favorite milk.', TRUE, NOW(), NOW()),
    (23, 'Tea', 120.00, 5, '🍵', 4.5, 103, 22, 18, 'Comforting tea for every mood. Brew strong or light—your perfect cup awaits.', TRUE, NOW(), NOW()),
    (24, 'Soda', 40.00, 5, '🥤', 3.8, 29, 0, 0, 'Classic fizzy soda—cool and refreshing. Best served chilled with ice.', FALSE, NOW(), NOW()),
    (65, 'Mango Juice', 80.00, 5, '🥭', 4.6, 94, 25, 18, 'Sweet and thick mango nectar, made from the finest ripe mangoes.', TRUE, NOW(), NOW()),
    (66, 'Apple Juice', 90.00, 5, '🍎', 4.5, 78, 22, 15, 'Clear and refreshing apple juice, naturally sweet and full of flavor.', TRUE, NOW(), NOW()),
    (67, 'Cranberry Juice', 150.00, 5, '🥤', 4.4, 52, 15, 0, 'Tart and refreshing cranberry juice, great on its own or as a mixer.', TRUE, NOW(), NOW()),
    (68, 'Green Tea', 180.00, 5, '🍵', 4.7, 145, 30, 20, 'Healthy green tea leaves, rich in antioxidants for a revitalizing break.', TRUE, NOW(), NOW()),
    (69, 'Energy Drink', 120.00, 5, '⚡', 4.1, 63, 40, 25, 'Instant energy boost to keep you going through your busy day.', TRUE, NOW(), NOW()),
    (70, 'Coconut Water', 60.00, 5, '🥥', 4.9, 112, 50, 12, 'Natural and refreshing coconut water, perfect for hydration and electrolytes.', TRUE, NOW(), NOW()),
    (71, 'Smoothie', 150.00, 5, '🥤', 4.8, 89, 12, 20, 'Delicious mixed fruit smoothie, a healthy and filling drink for any time.', TRUE, NOW(), NOW()),
    (72, 'Milkshake', 120.00, 5, '🥤', 4.7, 134, 15, 18, 'Thick and creamy chocolate milkshake, a classic treat for all ages.', TRUE, NOW(), NOW()),
    (73, 'Lemonade', 40.00, 5, '🍋', 4.3, 72, 45, 15, 'Zesty and refreshing lemonade, the perfect thirst quencher on a hot day.', TRUE, NOW(), NOW()),
    (74, 'Hot Chocolate', 100.00, 5, '☕', 4.6, 121, 20, 10, 'Rich and comforting hot chocolate, perfect for cozy evenings.', TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- COUPONS (5 coupons from legacy system)
-- =====================================================

INSERT INTO coupons (code, description, coupon_type, value, min_order_value, max_discount, applicable_categories, first_order_only, is_active, valid_from, valid_until, created_at)
VALUES
    (
        'SAVE20',
        '20% off orders above ₹500',
        'percentage',
        20.00,
        500.00,
        100.00,
        '[]'::JSONB,
        FALSE,
        TRUE,
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW()
    ),
    (
        'FRESH15',
        '15% off on fruits & vegetables',
        'category',
        15.00,
        200.00,
        75.00,
        '["Fruits", "Vegetables"]'::JSONB,
        FALSE,
        TRUE,
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW()
    ),
    (
        'WELCOME50',
        '₹50 off first order',
        'fixed',
        50.00,
        300.00,
        50.00,
        '[]'::JSONB,
        TRUE,
        TRUE,
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW()
    ),
    (
        'DAIRY10',
        '10% off on dairy products',
        'category',
        10.00,
        150.00,
        50.00,
        '["Dairy"]'::JSONB,
        FALSE,
        TRUE,
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW()
    ),
    (
        'SNACKS25',
        '₹25 off snacks orders',
        'fixed',
        25.00,
        100.00,
        25.00,
        '["Snacks"]'::JSONB,
        FALSE,
        TRUE,
        NOW(),
        NOW() + INTERVAL '1 year',
        NOW()
    )
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SITE SETTINGS
-- =====================================================

INSERT INTO site_settings (id, tax_rate, standard_delivery_charge, express_delivery_charge, free_delivery_threshold, site_name, site_currency, created_at, updated_at)
VALUES (
    1,
    0.0800,
    40.00,
    50.00,
    500.00,
    'HappyGroceries',
    '₹',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SORT OPTIONS
-- =====================================================

INSERT INTO sort_options (value, label, "order", is_active) VALUES
    ('popular', 'Most Popular', 1, TRUE),
    ('price_low', 'Price: Low to High', 2, TRUE),
    ('price_high', 'Price: High to Low', 3, TRUE),
    ('rating', 'Highest Rated', 4, TRUE),
    ('newest', 'Newest First', 5, TRUE)
ON CONFLICT (value) DO NOTHING;

-- =====================================================
-- SUMMARY OF SEED DATA
-- =====================================================
-- Categories: 5 (Fruits, Vegetables, Dairy, Snacks, Beverages)
-- Products: 74 total
--   - Fruits: 16 products (ID 1-6, 25-34)
--   - Vegetables: 16 products (ID 7-12, 35-44)
--   - Dairy: 14 products (ID 13-16, 45-54)
--   - Snacks: 14 products (ID 17-20, 55-64)
--   - Beverages: 16 products (ID 21-24, 65-74)
-- Coupons: 5 (SAVE20, FRESH15, WELCOME50, DAIRY10, SNACKS25)
-- Site Settings: Default tax rate 8%, standard delivery ₹40, express ₹50
-- Sort Options: 5 options (popular, price_low, price_high, rating, newest)
--
-- New tables (empty, created via schema.sql):
--   - combos (product bundles with discounts)
--   - combos_products (many-to-many relationship for combos)
--   - carts (shopping carts)
--   - cart_items (individual cart items)
--   - orders (customer orders)
--   - order_items (individual order items)
--   - coupon_usages (tracks coupon usage per user)
--   - wishlist_items (user wishlist)
--   - product_reviews (product reviews and ratings)
--   - review_helpful_votes (helpful votes on reviews)
--   - activity_logs (tracks user activities)
--   - contact_messages (stores contact form submissions)
-- =====================================================
