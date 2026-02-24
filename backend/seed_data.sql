-- Happy Groceries Seed Data
-- This file contains seed data matching the new schema
-- Run this after schema.sql to populate the database

-- =====================================================
-- SITE SETTINGS
-- =====================================================

INSERT INTO site_settings (tax_rate, standard_delivery_charge, express_delivery_charge, free_delivery_threshold, site_name, site_currency, created_at, updated_at)
VALUES (0.0800, 40.00, 50.00, 500.00, 'HappyGroceries', '₹', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- SORT OPTIONS
-- =====================================================

INSERT INTO sort_options (value, label, "order", is_active) VALUES
    ('price_asc', 'Price: Low to High', 1, TRUE),
    ('price_desc', 'Price: High to Low', 2, TRUE),
    ('name_asc', 'Name: A to Z', 3, TRUE),
    ('name_desc', 'Name: Z to A', 4, TRUE),
    ('rating_desc', 'Highest Rated', 5, TRUE),
    ('newest', 'Newest First', 6, TRUE)
ON CONFLICT (value) DO NOTHING;

-- =====================================================
-- CATEGORIES (5 categories)
-- =====================================================

INSERT INTO categories (name, description, emoji, color, created_at, is_deleted) VALUES
    ('Fruits', 'Fresh fruits from local farms', '🍎', '#FF6B6B', NOW(), FALSE),
    ('Vegetables', 'Fresh vegetables for a healthy diet', '🥕', '#4ECDC4', NOW(), FALSE),
    ('Dairy', 'Dairy products including milk, cheese, and more', '🥛', '#FFE66D', NOW(), FALSE),
    ('Snacks', 'Delicious snacks for every mood', '🍪', '#FF8C42', NOW(), FALSE),
    ('Beverages', 'Refreshing drinks and beverages', '🧃', '#6BCB77', NOW(), FALSE)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- BRANDS (10 brands)
-- =====================================================

INSERT INTO brands (name, slug, description, is_active, created_at, updated_at, is_deleted) VALUES
    ('FreshFarm', 'freshfarm', 'Premium quality farm fresh products', TRUE, NOW(), NOW(), FALSE),
    ('NatureBest', 'naturebest', 'Organic and natural food products', TRUE, NOW(), NOW(), FALSE),
    ('DailyDairy', 'dailydairy', 'Fresh dairy products daily', TRUE, NOW(), NOW(), FALSE),
    ('SnackHub', 'snackhub', 'Delicious snacks and munchies', TRUE, NOW(), NOW(), FALSE),
    ('DrinkFresh', 'drinkfresh', 'Refreshing beverages and drinks', TRUE, NOW(), NOW(), FALSE),
    ('GreenValley', 'greenvalley', 'Organic vegetables and greens', TRUE, NOW(), NOW(), FALSE),
    ('FruitMasters', 'fruitmasters', 'Premium quality fruits', TRUE, NOW(), NOW(), FALSE),
    ('PureGhee', 'pureghee', 'Traditional dairy products', TRUE, NOW(), NOW(), FALSE),
    ('NuttyBites', 'nuttybites', 'Healthy nuts and dry fruits', TRUE, NOW(), NOW(), FALSE),
    ('FarmFresh', 'farmfresh', 'Direct from farm to table', TRUE, NOW(), NOW(), FALSE)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PRODUCTS (73 products - 1 removed to make it 73)
-- =====================================================

-- FRUITS (15 products)
INSERT INTO products (id, name, price, mrp, unit, category_id, brand_id, brand_name, gst_rate, is_veg, is_organic, is_fresh, emoji, rating, reviews_count, stock, discount_percent, description, is_active, created_at, updated_at, is_deleted)
VALUES
    (1, 'Apple', 50.00, 60.00, 'kg', 1, 7, 'FruitMasters', 5.00, TRUE, FALSE, TRUE, '🍎', 4.5, 128, 25, 15, 'Crisp, juicy apples packed with fiber and natural sweetness. Perfect for snacking, salads, and fresh juice.', TRUE, NOW(), NOW(), FALSE),
    (2, 'Banana', 30.00, 40.00, 'dozen', 1, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🍌', 4.2, 94, 40, 20, 'Naturally sweet bananas rich in potassium. Great for smoothies, breakfast bowls, and quick energy.', TRUE, NOW(), NOW(), FALSE),
    (3, 'Orange', 40.00, 50.00, 'kg', 1, 7, 'FruitMasters', 5.00, TRUE, FALSE, TRUE, '🍊', 4.3, 76, 30, 18, 'Fresh oranges bursting with vitamin C. Enjoy as a snack or squeeze for a refreshing juice.', TRUE, NOW(), NOW(), FALSE),
    (4, 'Grapes', 80.00, 100.00, 'kg', 1, 7, 'FruitMasters', 5.00, TRUE, FALSE, TRUE, '🍇', 4.6, 62, 18, 25, 'Sweet, seedless grapes that are perfect for snacking and fruit platters. Chill for extra freshness.', TRUE, NOW(), NOW(), FALSE),
    (5, 'Strawberry', 120.00, 150.00, 'pack', 1, 2, 'NatureBest', 5.00, TRUE, TRUE, TRUE, '🍓', 4.8, 141, 10, 30, 'Bright, fragrant strawberries with a sweet-tart taste. Best for desserts, toppings, and smoothies.', TRUE, NOW(), NOW(), FALSE),
    (6, 'Watermelon', 60.00, 75.00, 'piece', 1, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🍉', 4.4, 58, 12, 12, 'Refreshing watermelon with a high water content—great for summer hydration and fruit salads.', TRUE, NOW(), NOW(), FALSE),
    (25, 'Mango', 100.00, 120.00, 'kg', 1, 7, 'FruitMasters', 5.00, TRUE, FALSE, TRUE, '🥭', 4.7, 115, 20, 25, 'Sweet and juicy Alphonso mangoes, known as the king of fruits.', TRUE, NOW(), NOW(), FALSE),
    (26, 'Pineapple', 80.00, 95.00, 'piece', 1, 1, 'FreshFarm', 5.00, TRUE, FALSE, TRUE, '🍍', 4.5, 82, 15, 20, 'Tropical pineapples with a sweet and tangy flavor. Great for desserts and juices.', TRUE, NOW(), NOW(), FALSE),
    (27, 'Kiwi', 120.00, 140.00, 'pack', 1, 2, 'NatureBest', 5.00, TRUE, TRUE, TRUE, '🥝', 4.6, 64, 25, 0, 'Tangy and vitamin-rich kiwis with a unique flavor and vibrant green flesh.', TRUE, NOW(), NOW(), FALSE),
    (28, 'Papaya', 50.00, 60.00, 'piece', 1, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🍈', 4.2, 45, 18, 18, 'Ripe and sweet papayas, perfect for a healthy breakfast or snack.', TRUE, NOW(), NOW(), FALSE),
    (29, 'Guava', 40.00, 50.00, 'kg', 1, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🍈', 4.1, 38, 30, 22, 'Fresh pink guavas, crunchy and full of vitamin C. Great with a pinch of salt and chili.', TRUE, NOW(), NOW(), FALSE),
    (30, 'Pomegranate', 150.00, 180.00, 'kg', 1, 2, 'NatureBest', 5.00, TRUE, TRUE, TRUE, '🍎', 4.8, 92, 12, 0, 'Juicy red pomegranate pearls, packed with antioxidants and sweet-tart flavor.', TRUE, NOW(), NOW(), FALSE),
    (31, 'Blueberry', 300.00, 350.00, 'pack', 1, 2, 'NatureBest', 5.00, TRUE, TRUE, TRUE, '🫐', 4.9, 156, 10, 0, 'Premium fresh blueberries, perfect for smoothies, pancakes, or healthy snacking.', TRUE, NOW(), NOW(), FALSE),
    (32, 'Peach', 180.00, 200.00, 'kg', 1, 7, 'FruitMasters', 5.00, TRUE, FALSE, TRUE, '🍑', 4.4, 53, 14, 0, 'Soft and sweet peaches with a delicate aroma. Ideal for desserts and salads.', TRUE, NOW(), NOW(), FALSE),
    (33, 'Cherry', 250.00, 300.00, 'pack', 1, 2, 'NatureBest', 5.00, TRUE, TRUE, TRUE, '🍒', 4.7, 124, 8, 0, 'Sweet red cherries, a perfect seasonal treat for snacking or baking.', TRUE, NOW(), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- VEGETABLES (15 products)
INSERT INTO products (id, name, price, mrp, unit, category_id, brand_id, brand_name, gst_rate, is_veg, is_organic, is_fresh, emoji, rating, reviews_count, stock, discount_percent, description, is_active, created_at, updated_at, is_deleted)
VALUES
    (7, 'Carrot', 30.00, 40.00, 'kg', 2, 6, 'GreenValley', 5.00, TRUE, FALSE, TRUE, '🥕', 4.0, 44, 35, 20, 'Crunchy carrots rich in beta-carotene. Ideal for salads, soups, and healthy snacking.', TRUE, NOW(), NOW(), FALSE),
    (8, 'Tomato', 25.00, 35.00, 'kg', 2, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🍅', 4.1, 52, 28, 15, 'Juicy tomatoes that add flavor to curries, sandwiches, and salads. A kitchen staple!', TRUE, NOW(), NOW(), FALSE),
    (9, 'Broccoli', 45.00, 60.00, 'piece', 2, 6, 'GreenValley', 5.00, TRUE, TRUE, TRUE, '🥦', 4.2, 39, 16, 18, 'Fresh broccoli florets loaded with nutrients. Steam, stir-fry, or roast for a delicious side.', TRUE, NOW(), NOW(), FALSE),
    (10, 'Cucumber', 35.00, 45.00, 'kg', 2, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🥒', 3.9, 31, 22, 22, 'Cool and crisp cucumbers—perfect for salads, raita, and refreshing hydration.', TRUE, NOW(), NOW(), FALSE),
    (11, 'Potato', 20.00, 25.00, 'kg', 2, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🥔', 4.0, 67, 50, 10, 'Versatile potatoes for curries, fries, and snacks. A must-have for everyday cooking.', TRUE, NOW(), NOW(), FALSE),
    (35, 'Spinach', 30.00, 40.00, 'bunch', 2, 6, 'GreenValley', 5.00, TRUE, TRUE, TRUE, '🥬', 4.5, 78, 40, 15, 'Fresh green spinach leaves, nutrient-dense and versatile for cooking.', TRUE, NOW(), NOW(), FALSE),
    (36, 'Cauliflower', 50.00, 65.00, 'piece', 2, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🥦', 4.1, 42, 22, 18, 'Fresh white cauliflower florets, great for curries, roasting, or stir-frying.', TRUE, NOW(), NOW(), FALSE),
    (37, 'Cabbage', 40.00, 50.00, 'piece', 2, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🥬', 4.0, 35, 25, 20, 'Crunchy green cabbage, perfect for salads, slaws, and stir-fries.', TRUE, NOW(), NOW(), FALSE),
    (38, 'Onion', 45.00, 55.00, 'kg', 2, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🧅', 4.2, 160, 100, 10, 'Essential red onions for every kitchen. Adds flavor and crunch to any dish.', TRUE, NOW(), NOW(), FALSE),
    (39, 'Garlic', 20.00, 25.00, 'pack', 2, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🧄', 4.6, 95, 60, 12, 'Pungent and flavorful garlic cloves, a must-have for seasoning and health.', TRUE, NOW(), NOW(), FALSE),
    (40, 'Bell Pepper', 80.00, 100.00, 'kg', 2, 6, 'GreenValley', 5.00, TRUE, TRUE, TRUE, '🫑', 4.4, 67, 15, 15, 'Vibrant and crunchy bell peppers, perfect for stir-fries, salads, and stuffing.', TRUE, NOW(), NOW(), FALSE),
    (41, 'Sweet Potato', 60.00, 75.00, 'kg', 2, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🍠', 4.3, 48, 30, 18, 'Nutritious sweet potatoes, great for roasting, mashing, or as a healthy snack.', TRUE, NOW(), NOW(), FALSE),
    (42, 'Peas', 70.00, 85.00, 'kg', 2, 6, 'GreenValley', 5.00, TRUE, TRUE, TRUE, '🫛', 4.5, 52, 20, 20, 'Fresh green peas, sweet and tender. Ideal for curries, pulao, and side dishes.', TRUE, NOW(), NOW(), FALSE),
    (43, 'Beans', 50.00, 65.00, 'kg', 2, 10, 'FarmFresh', 5.00, TRUE, FALSE, TRUE, '🫛', 4.2, 41, 25, 16, 'Fresh green beans, crunchy and nutritious. Great for stir-frying and steaming.', TRUE, NOW(), NOW(), FALSE),
    (44, 'Mushrooms', 90.00, 110.00, 'pack', 2, 1, 'FreshFarm', 5.00, TRUE, FALSE, TRUE, '🍄', 4.7, 84, 12, 0, 'Fresh button mushrooms, earthy and savory. Perfect for pasta, pizzas, and stir-fries.', TRUE, NOW(), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- DAIRY (14 products)
INSERT INTO products (id, name, price, mrp, unit, category_id, brand_id, brand_name, gst_rate, is_veg, is_organic, is_fresh, emoji, rating, reviews_count, stock, discount_percent, description, is_active, created_at, updated_at, is_deleted)
VALUES
    (13, 'Milk', 55.00, 65.00, 'ltr', 3, 3, 'DailyDairy', 5.00, TRUE, FALSE, TRUE, '🥛', 4.5, 110, 24, 10, 'Fresh, creamy milk—perfect for tea, coffee, cereals, and everyday nutrition.', TRUE, NOW(), NOW(), FALSE),
    (14, 'Cheese', 150.00, 180.00, 'pack', 3, 3, 'DailyDairy', 12.00, TRUE, FALSE, TRUE, '🧀', 4.7, 88, 14, 15, 'Rich and flavorful cheese that melts beautifully. Great for sandwiches, pasta, and snacks.', TRUE, NOW(), NOW(), FALSE),
    (15, 'Butter', 180.00, 200.00, 'pack', 3, 8, 'PureGhee', 12.00, TRUE, FALSE, TRUE, '🧈', 4.6, 73, 9, 8, 'Creamy butter for spreading, baking, and cooking. Adds a delicious richness to any dish.', TRUE, NOW(), NOW(), FALSE),
    (16, 'Yogurt', 60.00, 75.00, 'pack', 3, 3, 'DailyDairy', 5.00, TRUE, FALSE, TRUE, '🥛', 4.4, 66, 18, 12, 'Smooth yogurt that''s great for breakfast, smoothies, and homemade raita.', TRUE, NOW(), NOW(), FALSE),
    (45, 'Paneer', 120.00, 140.00, 'pack', 3, 3, 'DailyDairy', 5.00, TRUE, FALSE, TRUE, '🧀', 4.8, 142, 18, 12, 'Fresh and soft cottage cheese (paneer), a versatile protein for Indian dishes.', TRUE, NOW(), NOW(), FALSE),
    (46, 'Ghee', 600.00, 700.00, 'jar', 3, 8, 'PureGhee', 5.00, TRUE, FALSE, TRUE, '🧈', 4.9, 215, 15, 10, 'Pure cow ghee, aromatic and rich. Perfect for cooking and adding flavor to meals.', TRUE, NOW(), NOW(), FALSE),
    (47, 'Ice Cream', 250.00, 300.00, 'pack', 3, 3, 'DailyDairy', 18.00, TRUE, FALSE, TRUE, '🍦', 4.7, 188, 10, 15, 'Creamy vanilla ice cream, the perfect dessert to satisfy your sweet cravings.', TRUE, NOW(), NOW(), FALSE),
    (48, 'Buttermilk', 30.00, 35.00, 'bottle', 3, 3, 'DailyDairy', 5.00, TRUE, FALSE, TRUE, '🥛', 4.2, 63, 40, 8, 'Refreshing and cooling buttermilk, great for digestion and summer heat.', TRUE, NOW(), NOW(), FALSE),
    (49, 'Flavored Yogurt', 80.00, 95.00, 'cup', 3, 3, 'DailyDairy', 5.00, TRUE, FALSE, TRUE, '🥛', 4.5, 76, 25, 12, 'Delicious fruit-flavored yogurt, a healthy and tasty snack for any time.', TRUE, NOW(), NOW(), FALSE),
    (50, 'Whipped Cream', 150.00, 180.00, 'can', 3, 3, 'DailyDairy', 12.00, TRUE, FALSE, TRUE, '🥛', 4.3, 45, 12, 0, 'Light and fluffy whipped cream, perfect for topping desserts and fruits.', TRUE, NOW(), NOW(), FALSE),
    (51, 'Sour Cream', 120.00, 140.00, 'pack', 3, 3, 'DailyDairy', 12.00, TRUE, FALSE, TRUE, '🥛', 4.1, 32, 15, 0, 'Thick and tangy sour cream, ideal for dips, baked potatoes, and tacos.', TRUE, NOW(), NOW(), FALSE),
    (52, 'Condensed Milk', 180.00, 200.00, 'can', 3, 3, 'DailyDairy', 5.00, TRUE, FALSE, TRUE, '🥛', 4.6, 87, 20, 10, 'Sweetened condensed milk, a key ingredient for many delicious desserts.', TRUE, NOW(), NOW(), FALSE),
    (53, 'Soya Milk', 90.00, 110.00, 'ltr', 3, 2, 'NatureBest', 5.00, TRUE, TRUE, TRUE, '🥛', 4.0, 42, 18, 15, 'Nutritious plant-based soya milk, a great dairy alternative for health-conscious users.', TRUE, NOW(), NOW(), FALSE),
    (54, 'Almond Milk', 250.00, 300.00, 'ltr', 3, 2, 'NatureBest', 5.00, TRUE, TRUE, TRUE, '🥛', 4.4, 59, 14, 0, 'Creamy almond milk, a delicious and healthy non-dairy milk alternative.', TRUE, NOW(), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- SNACKS (14 products)
INSERT INTO products (id, name, price, mrp, unit, category_id, brand_id, brand_name, gst_rate, is_veg, is_organic, is_fresh, emoji, rating, reviews_count, stock, discount_percent, description, is_active, created_at, updated_at, is_deleted)
VALUES
    (17, 'Cookies', 80.00, 100.00, 'pack', 4, 4, 'SnackHub', 12.00, TRUE, FALSE, FALSE, '🍪', 4.8, 152, 32, 25, 'Crunchy cookies with a delightful sweetness—perfect with tea, coffee, or as a quick treat.', TRUE, NOW(), NOW(), FALSE),
    (18, 'Chips', 50.00, 65.00, 'pack', 4, 4, 'SnackHub', 12.00, TRUE, FALSE, FALSE, '🥔', 4.5, 97, 45, 20, 'Crispy, salty chips for movie nights and snack cravings. Enjoy the crunch!', TRUE, NOW(), NOW(), FALSE),
    (19, 'Chocolate', 100.00, 120.00, 'bar', 4, 4, 'SnackHub', 18.00, TRUE, FALSE, FALSE, '🍫', 4.9, 210, 27, 30, 'Smooth, indulgent chocolate to satisfy your sweet tooth. Great for gifting and desserts.', TRUE, NOW(), NOW(), FALSE),
    (20, 'Popcorn', 70.00, 85.00, 'pack', 4, 4, 'SnackHub', 12.00, TRUE, FALSE, FALSE, '🍿', 4.3, 54, 38, 35, 'Light and fluffy popcorn—perfect for binge-watching and quick snacking.', TRUE, NOW(), NOW(), FALSE),
    (55, 'Almonds', 400.00, 480.00, 'pack', 4, 9, 'NuttyBites', 5.00, TRUE, FALSE, FALSE, '🥜', 4.8, 134, 30, 15, 'Premium roasted almonds, a crunchy and nutritious snack packed with vitamin E.', TRUE, NOW(), NOW(), FALSE),
    (56, 'Cashews', 500.00, 600.00, 'pack', 4, 9, 'NuttyBites', 5.00, TRUE, FALSE, FALSE, '🥜', 4.9, 122, 25, 18, 'Creamy and delicious cashew nuts, perfect for snacking or adding to desserts.', TRUE, NOW(), NOW(), FALSE),
    (57, 'Walnuts', 600.00, 720.00, 'pack', 4, 9, 'NuttyBites', 5.00, TRUE, FALSE, FALSE, '🥜', 4.7, 88, 20, 20, 'Healthy walnuts, rich in omega-3 fatty acids. Great for brain health and snacking.', TRUE, NOW(), NOW(), FALSE),
    (58, 'Raisins', 150.00, 180.00, 'pack', 4, 9, 'NuttyBites', 5.00, TRUE, FALSE, FALSE, '🍇', 4.5, 67, 35, 22, 'Sweet and chewy raisins, a natural energy booster for your day.', TRUE, NOW(), NOW(), FALSE),
    (59, 'Granola', 250.00, 300.00, 'pack', 4, 9, 'NuttyBites', 12.00, TRUE, FALSE, FALSE, '🥣', 4.4, 91, 15, 25, 'Crunchy granola with nuts and honey, perfect for a healthy breakfast or snack.', TRUE, NOW(), NOW(), FALSE),
    (60, 'Trail Mix', 300.00, 360.00, 'pack', 4, 9, 'NuttyBites', 12.00, TRUE, FALSE, FALSE, '🥜', 4.6, 73, 20, 20, 'A mix of nuts, seeds, and dried fruits for sustained energy on the go.', TRUE, NOW(), NOW(), FALSE),
    (61, 'Pretzels', 100.00, 120.00, 'pack', 4, 4, 'SnackHub', 12.00, TRUE, FALSE, FALSE, '🥨', 4.2, 54, 40, 30, 'Classic salted pretzels, a crunchy and satisfying snack for any time.', TRUE, NOW(), NOW(), FALSE),
    (62, 'Nachos', 90.00, 110.00, 'pack', 4, 4, 'SnackHub', 12.00, TRUE, FALSE, FALSE, '🌮', 4.3, 86, 30, 25, 'Crispy corn nachos, perfect with cheese dip or salsa for movie nights.', TRUE, NOW(), NOW(), FALSE),
    (63, 'Peanuts', 60.00, 75.00, 'pack', 4, 9, 'NuttyBites', 5.00, TRUE, FALSE, FALSE, '🥜', 4.1, 102, 50, 15, 'Roasted and salted peanuts, a classic and affordable high-protein snack.', TRUE, NOW(), NOW(), FALSE),
    (64, 'Pistachios', 700.00, 850.00, 'pack', 4, 9, 'NuttyBites', 5.00, TRUE, FALSE, FALSE, '🥜', 4.8, 115, 18, 0, 'Delicious roasted pistachios, fun to crack and full of nutrients.', TRUE, NOW(), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- BEVERAGES (15 products)
INSERT INTO products (id, name, price, mrp, unit, category_id, brand_id, brand_name, gst_rate, is_veg, is_organic, is_fresh, emoji, rating, reviews_count, stock, discount_percent, description, is_active, created_at, updated_at, is_deleted)
VALUES
    (21, 'Orange Juice', 90.00, 110.00, 'bottle', 5, 5, 'DrinkFresh', 12.00, TRUE, FALSE, FALSE, '🧃', 4.4, 61, 20, 15, 'Refreshing orange juice with a citrusy punch. Serve chilled for the best taste.', TRUE, NOW(), NOW(), FALSE),
    (22, 'Coffee', 200.00, 240.00, 'jar', 5, 5, 'DrinkFresh', 12.00, TRUE, FALSE, FALSE, '☕', 4.7, 139, 15, 20, 'Aromatic coffee to kickstart your day. Enjoy hot, iced, or with your favorite milk.', TRUE, NOW(), NOW(), FALSE),
    (23, 'Tea', 120.00, 140.00, 'pack', 5, 5, 'DrinkFresh', 5.00, TRUE, FALSE, FALSE, '🍵', 4.5, 103, 22, 18, 'Comforting tea for every mood. Brew strong or light—your perfect cup awaits.', TRUE, NOW(), NOW(), FALSE),
    (65, 'Mango Juice', 80.00, 95.00, 'bottle', 5, 5, 'DrinkFresh', 12.00, TRUE, FALSE, FALSE, '🥭', 4.6, 94, 25, 18, 'Sweet and thick mango nectar, made from the finest ripe mangoes.', TRUE, NOW(), NOW(), FALSE),
    (66, 'Apple Juice', 90.00, 110.00, 'bottle', 5, 5, 'DrinkFresh', 12.00, TRUE, FALSE, FALSE, '🍎', 4.5, 78, 22, 15, 'Clear and refreshing apple juice, naturally sweet and full of flavor.', TRUE, NOW(), NOW(), FALSE),
    (67, 'Cranberry Juice', 150.00, 180.00, 'bottle', 5, 5, 'DrinkFresh', 12.00, TRUE, FALSE, FALSE, '🥤', 4.4, 52, 15, 0, 'Tart and refreshing cranberry juice, great on its own or as a mixer.', TRUE, NOW(), NOW(), FALSE),
    (68, 'Green Tea', 180.00, 220.00, 'pack', 5, 5, 'DrinkFresh', 5.00, TRUE, FALSE, FALSE, '🍵', 4.7, 145, 30, 20, 'Healthy green tea leaves, rich in antioxidants for a revitalizing break.', TRUE, NOW(), NOW(), FALSE),
    (69, 'Energy Drink', 120.00, 150.00, 'can', 5, 5, 'DrinkFresh', 28.00, TRUE, FALSE, FALSE, '⚡', 4.1, 63, 40, 25, 'Instant energy boost to keep you going through your busy day.', TRUE, NOW(), NOW(), FALSE),
    (70, 'Coconut Water', 60.00, 75.00, 'bottle', 5, 1, 'FreshFarm', 5.00, TRUE, FALSE, TRUE, '🥥', 4.9, 112, 50, 12, 'Natural and refreshing coconut water, perfect for hydration and electrolytes.', TRUE, NOW(), NOW(), FALSE),
    (71, 'Smoothie', 150.00, 180.00, 'bottle', 5, 5, 'DrinkFresh', 12.00, TRUE, FALSE, FALSE, '🥤', 4.8, 89, 12, 20, 'Delicious mixed fruit smoothie, a healthy and filling drink for any time.', TRUE, NOW(), NOW(), FALSE),
    (72, 'Milkshake', 120.00, 150.00, 'bottle', 5, 3, 'DailyDairy', 12.00, TRUE, FALSE, FALSE, '🥤', 4.7, 134, 15, 18, 'Thick and creamy chocolate milkshake, a classic treat for all ages.', TRUE, NOW(), NOW(), FALSE),
    (73, 'Lemonade', 40.00, 50.00, 'bottle', 5, 5, 'DrinkFresh', 12.00, TRUE, FALSE, FALSE, '🍋', 4.3, 72, 45, 15, 'Zesty and refreshing lemonade, the perfect thirst quencher on a hot day.', TRUE, NOW(), NOW(), FALSE),
    (74, 'Hot Chocolate', 100.00, 120.00, 'pack', 5, 5, 'DrinkFresh', 12.00, TRUE, FALSE, FALSE, '☕', 4.6, 121, 20, 10, 'Rich and comforting hot chocolate, perfect for cozy evenings.', TRUE, NOW(), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMBOS (10 combos)
-- =====================================================

INSERT INTO combos (name, description, discount_percent, is_active, created_at, updated_at, is_deleted) VALUES
    ('Fruit Fiesta', 'A delightful mix of seasonal fresh fruits including apples, bananas, and oranges. Perfect for a healthy family.', 15, TRUE, NOW(), NOW(), FALSE),
    ('Veggie Delight', 'Fresh vegetable combo with carrots, tomatoes, broccoli, and cucumbers for your daily cooking needs.', 12, TRUE, NOW(), NOW(), FALSE),
    ('Dairy Essentials', 'Must-have dairy products including milk, cheese, butter, and yogurt for your everyday meals.', 10, TRUE, NOW(), NOW(), FALSE),
    ('Snack Attack', 'A perfect combination of cookies, chips, chocolate, and popcorn for your movie nights.', 20, TRUE, NOW(), NOW(), FALSE),
    ('Healthy Nuts', 'Premium selection of almonds, cashews, walnuts, and raisins for healthy snacking.', 18, TRUE, NOW(), NOW(), FALSE),
    ('Beverage Bundle', 'Refreshing drinks combo with orange juice, coffee, tea, and coconut water.', 15, TRUE, NOW(), NOW(), FALSE),
    ('Breakfast Combo', 'Start your day right with milk, bread, eggs, orange juice, and cereal.', 12, TRUE, NOW(), NOW(), FALSE),
    ('Salad Pack', 'Fresh ingredients for a healthy salad - lettuce, tomatoes, cucumbers, carrots, and bell peppers.', 10, TRUE, NOW(), NOW(), FALSE),
    ('Smoothie Kit', 'Everything you need for delicious smoothies - bananas, strawberries, yogurt, and almond milk.', 15, TRUE, NOW(), NOW(), FALSE),
    ('Party Pack', 'Perfect for gatherings - chips, nachos, cookies, soda, and chocolates.', 25, TRUE, NOW(), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- Link combos with products (combos_products)
INSERT INTO combos_products (combo_id, product_id) VALUES
    -- Fruit Fiesta (Combo 1)
    (1, 1), (1, 2), (1, 3), (1, 25),
    -- Veggie Delight (Combo 2)
    (2, 7), (2, 8), (2, 9), (2, 10),
    -- Dairy Essentials (Combo 3)
    (3, 13), (3, 14), (3, 15), (3, 16),
    -- Snack Attack (Combo 4)
    (4, 17), (4, 18), (4, 19), (4, 20),
    -- Healthy Nuts (Combo 5)
    (5, 55), (5, 56), (5, 57), (5, 58),
    -- Beverage Bundle (Combo 6)
    (6, 21), (6, 22), (6, 23), (6, 70),
    -- Breakfast Combo (Combo 7)
    (7, 13), (7, 1), (7, 2), (7, 21),
    -- Salad Pack (Combo 8)
    (8, 35), (8, 8), (8, 10), (8, 7),
    -- Smoothie Kit (Combo 9)
    (9, 2), (9, 5), (9, 16), (9, 54),
    -- Party Pack (Combo 10)
    (10, 18), (10, 19), (10, 20), (10, 62)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COUPONS (10 coupons)
-- =====================================================

INSERT INTO coupons (code, description, coupon_type, value, min_order_value, max_discount, applicable_categories, first_order_only, usage_limit, is_active, valid_from, valid_until, created_at, is_deleted)
VALUES
    ('SAVE20', '20% off orders above ₹500', 'percentage', 20.00, 500.00, 100.00, '[]'::JSONB, FALSE, NULL, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), FALSE),
    ('FRESH15', '15% off on fruits & vegetables', 'category', 15.00, 200.00, 75.00, '["Fruits", "Vegetables"]'::JSONB, FALSE, NULL, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), FALSE),
    ('WELCOME50', '₹50 off first order', 'fixed', 50.00, 300.00, 50.00, '[]'::JSONB, TRUE, 1, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), FALSE),
    ('DAIRY10', '10% off on dairy products', 'category', 10.00, 150.00, 50.00, '["Dairy"]'::JSONB, FALSE, NULL, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), FALSE),
    ('SNACKS25', '₹25 off snacks orders', 'fixed', 25.00, 100.00, 25.00, '["Snacks"]'::JSONB, FALSE, NULL, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), FALSE),
    ('MEGA30', '30% off on orders above ₹1000', 'percentage', 30.00, 1000.00, 200.00, '[]'::JSONB, FALSE, NULL, TRUE, NOW(), NOW() + INTERVAL '6 months', NOW(), FALSE),
    ('BEVERAGE15', '15% off on beverages', 'category', 15.00, 150.00, 60.00, '["Beverages"]'::JSONB, FALSE, NULL, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), FALSE),
    ('ORGANIC20', '20% off organic products', 'category', 20.00, 300.00, 100.00, '["Fruits", "Vegetables", "Dairy"]'::JSONB, FALSE, NULL, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), FALSE),
    ('FLASH10', 'Flat ₹100 off on orders above ₹800', 'fixed', 100.00, 800.00, 100.00, '[]'::JSONB, FALSE, 100, TRUE, NOW(), NOW() + INTERVAL '1 month', NOW(), FALSE),
    ('VIP25', '25% off for VIP members', 'percentage', 25.00, 500.00, 150.00, '[]'::JSONB, FALSE, NULL, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW(), FALSE)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SUMMARY OF SEED DATA
-- =====================================================
-- Site Settings: 1 record (default configuration)
-- Sort Options: 6 options (price_asc, price_desc, name_asc, name_desc, rating_desc, newest)
-- Categories: 5 (Fruits, Vegetables, Dairy, Snacks, Beverages)
-- Brands: 10 (FreshFarm, NatureBest, DailyDairy, SnackHub, DrinkFresh, GreenValley, FruitMasters, PureGhee, NuttyBites, FarmFresh)
-- Products: 73 total
--   - Fruits: 15 products
--   - Vegetables: 15 products
--   - Dairy: 14 products
--   - Snacks: 14 products
--   - Beverages: 14 products
-- Combos: 10 combos linked to products
-- Coupons: 10 coupons with various types (percentage, fixed, category)
--
-- New tables (empty, created via schema.sql):
--   - users (populated via registration)
--   - carts (user-specific)
--   - cart_items (user-specific)
--   - orders (user-specific)
--   - order_items (user-specific)
--   - coupons_usages (tracks coupon redemptions)
--   - wishlist_items (user-specific)
--   - product_reviews (user-specific)
--   - review_helpful_votes (user-specific)
--   - activity_logs (tracks user activities)
--   - contact_messages (stores contact form submissions)
-- =====================================================
