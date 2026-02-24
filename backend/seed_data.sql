-- Happy Groceries - Corrected Seed Data - Ahmedabad, Gujarat - February 2026
-- Updated GST rates as per user specifications: Ice Cream 18%, Butter 12%, Ghee 12%, Condensed Milk 12%, Branded Biscuits 18%, Chocolate 18%, Branded Chips 12%, Packaged Namkeen/Popcorn 12%, Branded Packaged Dry Fruits 12%
-- All products have rating = 0.0 and reviews_count = 0

-- BRANDS
INSERT INTO brands (id, name, slug, description, is_active, created_at, updated_at) VALUES
(1, 'fresho!', 'fresho', 'BigBasket own fresh produce', TRUE, NOW(), NOW()),
(2, 'Amul', 'amul', 'Leading Indian dairy brand', TRUE, NOW(), NOW()),
(3, 'Britannia', 'britannia', 'Biscuits & bakery', TRUE, NOW(), NOW()),
(4, 'Lay''s', 'lays', 'Chips & savory snacks', TRUE, NOW(), NOW()),
(5, 'Cadbury', 'cadbury', 'Chocolates', TRUE, NOW(), NOW()),
(6, 'Happilo', 'happilo', 'Premium nuts & dry fruits', TRUE, NOW(), NOW()),
(7, 'Tata Sampann', 'tata-sampann', 'Premium pulses & dry fruits', TRUE, NOW(), NOW()),
(8, 'Real', 'real', 'Fruit juices', TRUE, NOW(), NOW()),
(9, 'Tropicana', 'tropicana', 'Premium juices', TRUE, NOW(), NOW()),
(10, 'Red Label', 'red-label', 'Tea', TRUE, NOW(), NOW()),
(11, 'Nescafe', 'nescafe', 'Coffee', TRUE, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- CATEGORIES
INSERT INTO categories (id, name, description, emoji, color, created_at) VALUES
(1, 'Fruits', 'Fresh fruits from local farms', '🍎', 'var(--primary-pink)', NOW()),
(2, 'Vegetables', 'Fresh vegetables for a healthy diet', '🥕', 'var(--primary-green)', NOW()),
(3, 'Dairy', 'Dairy products including milk, cheese, and more', '🥛', 'var(--primary-blue)', NOW()),
(4, 'Snacks', 'Delicious snacks for every mood', '🍪', 'var(--primary-orange)', NOW()),
(5, 'Beverages', 'Refreshing drinks and beverages', '🧃', 'var(--primary-purple)', NOW())
ON CONFLICT (name) DO NOTHING;

-- ALL 74 PRODUCTS - rating 0.0, reviews_count 0, corrected GST
INSERT INTO products (
    id, name, price, mrp, unit, pack_size, category_id, brand_id, gst_rate,
    is_veg, is_organic, is_fresh, emoji, rating, reviews_count, stock,
    discount_percent, description, is_active, created_at, updated_at
) VALUES
-- Fruits (0%)
(1, 'Apple', 185.00, 230.00, 'kg', 1.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍎', 0.0, 0, 60, 20, 'Crisp Washington apples', TRUE, NOW(), NOW()),
(2, 'Banana', 58.00, 75.00, 'kg', 1.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍌', 0.0, 0, 100, 23, 'Robusta bananas', TRUE, NOW(), NOW()),
(3, 'Orange', 95.00, 120.00, 'kg', 1.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍊', 0.0, 0, 70, 21, 'Nagpur oranges', TRUE, NOW(), NOW()),
(4, 'Grapes', 100.00, 130.00, 'g', 500.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍇', 0.0, 0, 50, 23, 'Seedless grapes', TRUE, NOW(), NOW()),
(5, 'Strawberry', 170.00, 210.00, 'g', 200.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍓', 0.0, 0, 25, 19, 'Fresh strawberries', TRUE, NOW(), NOW()),
(6, 'Watermelon', 38.00, 52.00, 'kg', 4.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍉', 0.0, 0, 40, 27, 'Medium watermelon', TRUE, NOW(), NOW()),
(25, 'Mango', 125.00, 155.00, 'kg', 1.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🥭', 0.0, 0, 50, 19, 'Alphonso mangoes', TRUE, NOW(), NOW()),
(26, 'Pineapple', 85.00, 105.00, 'piece', 1.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍍', 0.0, 0, 30, 19, 'Sweet pineapple', TRUE, NOW(), NOW()),
(27, 'Kiwi', 160.00, 200.00, 'piece', 3.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🥝', 0.0, 0, 60, 20, 'Green kiwi', TRUE, NOW(), NOW()),
(28, 'Papaya', 65.00, 80.00, 'kg', 1.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍈', 0.0, 0, 45, 19, 'Ripe papaya', TRUE, NOW(), NOW()),
(29, 'Guava', 75.00, 95.00, 'kg', 1.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍈', 0.0, 0, 70, 21, 'Pink guava', TRUE, NOW(), NOW()),
(30, 'Pomegranate', 190.00, 240.00, 'kg', 1.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍎', 0.0, 0, 30, 21, 'Bhagwa pomegranate', TRUE, NOW(), NOW()),
(31, 'Blueberry', 380.00, 480.00, 'g', 125.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🫐', 0.0, 0, 20, 21, 'Imported blueberries', TRUE, NOW(), NOW()),
(32, 'Peach', 220.00, 270.00, 'kg', 1.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍑', 0.0, 0, 25, 19, 'Fresh peaches', TRUE, NOW(), NOW()),
(33, 'Cherry', 420.00, 520.00, 'g', 250.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🍒', 0.0, 0, 15, 19, 'Imported cherries', TRUE, NOW(), NOW()),
(34, 'Avocado', 130.00, 160.00, 'piece', 1.00, 1, 1, 0.00, TRUE, FALSE, TRUE, '🥑', 0.0, 0, 40, 19, 'Hass avocado', TRUE, NOW(), NOW()),

-- Vegetables (0%)
(7, 'Carrot', 38.00, 48.00, 'kg', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🥕', 0.0, 0, 80, 21, 'Red carrots', TRUE, NOW(), NOW()),
(8, 'Tomato', 42.00, 55.00, 'kg', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🍅', 0.0, 0, 90, 24, 'Hybrid tomatoes', TRUE, NOW(), NOW()),
(9, 'Broccoli', 110.00, 140.00, 'piece', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🥦', 0.0, 0, 35, 21, 'Fresh broccoli', TRUE, NOW(), NOW()),
(10, 'Cucumber', 50.00, 65.00, 'kg', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🥒', 0.0, 0, 60, 23, 'Green cucumber', TRUE, NOW(), NOW()),
(11, 'Potato', 32.00, 42.00, 'kg', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🥔', 0.0, 0, 120, 24, 'Fresh potatoes', TRUE, NOW(), NOW()),
(12, 'Corn', 45.00, 58.00, 'piece', 2.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🌽', 0.0, 0, 50, 22, 'Sweet corn cobs', TRUE, NOW(), NOW()),
(35, 'Spinach', 45.00, 58.00, 'bunch', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🥬', 0.0, 0, 70, 22, 'Palak leaves', TRUE, NOW(), NOW()),
(36, 'Cauliflower', 55.00, 70.00, 'piece', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🥦', 0.0, 0, 50, 21, 'Fresh cauliflower', TRUE, NOW(), NOW()),
(37, 'Cabbage', 38.00, 48.00, 'piece', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🥬', 0.0, 0, 60, 21, 'Green cabbage', TRUE, NOW(), NOW()),
(38, 'Onion', 55.00, 70.00, 'kg', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🧅', 0.0, 0, 150, 21, 'Red onions', TRUE, NOW(), NOW()),
(39, 'Garlic', 180.00, 230.00, 'kg', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🧄', 0.0, 0, 80, 22, 'Fresh garlic', TRUE, NOW(), NOW()),
(40, 'Bell Pepper', 90.00, 115.00, 'kg', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🫑', 0.0, 0, 40, 22, 'Colored capsicum', TRUE, NOW(), NOW()),
(41, 'Sweet Potato', 65.00, 85.00, 'kg', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🍠', 0.0, 0, 60, 24, 'Shakarkandi', TRUE, NOW(), NOW()),
(42, 'Green Peas', 110.00, 140.00, 'kg', 1.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🫛', 0.0, 0, 45, 21, 'Shelled peas', TRUE, NOW(), NOW()),
(43, 'French Beans', 80.00, 100.00, 'g', 500.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🫛', 0.0, 0, 55, 20, 'Fresh beans', TRUE, NOW(), NOW()),
(44, 'Mushrooms', 120.00, 150.00, 'pack', 200.00, 2, 1, 0.00, TRUE, FALSE, TRUE, '🍄', 0.0, 0, 30, 20, 'Button mushrooms', TRUE, NOW(), NOW()),

-- Dairy (corrected: Ice Cream 18%, Butter 12%, Ghee 12%, Condensed Milk 12%, others 5%)
(13, 'Milk', 68.00, 72.00, 'ltr', 1.00, 3, 2, 5.00, TRUE, FALSE, FALSE, '🥛', 0.0, 0, 150, 6, 'Amul Gold milk', TRUE, NOW(), NOW()),
(14, 'Cheese', 105.00, 125.00, 'g', 200.00, 3, 2, 5.00, TRUE, FALSE, FALSE, '🧀', 0.0, 0, 40, 16, 'Amul cheese block', TRUE, NOW(), NOW()),
(15, 'Butter', 265.00, 285.00, 'g', 500.00, 3, 2, 12.00, TRUE, FALSE, FALSE, '🧈', 0.0, 0, 30, 7, 'Amul butter', TRUE, NOW(), NOW()),
(16, 'Yogurt', 55.00, 60.00, 'g', 400.00, 3, 2, 5.00, TRUE, FALSE, FALSE, '🥛', 0.0, 0, 80, 8, 'Amul plain curd', TRUE, NOW(), NOW()),
(45, 'Paneer', 90.00, 105.00, 'g', 200.00, 3, 2, 5.00, TRUE, FALSE, FALSE, '🧀', 0.0, 0, 50, 14, 'Fresh paneer', TRUE, NOW(), NOW()),
(46, 'Ghee', 640.00, 700.00, 'ml', 1000.00, 3, 2, 12.00, TRUE, FALSE, FALSE, '🧈', 0.0, 0, 35, 9, 'Amul cow ghee', TRUE, NOW(), NOW()),
(47, 'Ice Cream', 230.00, 260.00, 'ltr', 1.00, 3, 2, 18.00, TRUE, FALSE, FALSE, '🍦', 0.0, 0, 20, 12, 'Amul vanilla ice cream', TRUE, NOW(), NOW()),
(48, 'Buttermilk', 35.00, 38.00, 'ml', 500.00, 3, 2, 5.00, TRUE, FALSE, FALSE, '🥛', 0.0, 0, 90, 8, 'Chaas', TRUE, NOW(), NOW()),
(49, 'Flavored Yogurt', 60.00, 68.00, 'g', 200.00, 3, 2, 5.00, TRUE, FALSE, FALSE, '🥛', 0.0, 0, 60, 12, 'Fruit yogurt', TRUE, NOW(), NOW()),
(50, 'Whipped Cream', 180.00, 200.00, 'ml', 200.00, 3, NULL, 5.00, TRUE, FALSE, FALSE, '🥛', 0.0, 0, 25, 10, 'Whipped topping', TRUE, NOW(), NOW()),
(51, 'Sour Cream', 140.00, 155.00, 'g', 200.00, 3, NULL, 5.00, TRUE, FALSE, FALSE, '🥛', 0.0, 0, 30, 10, 'Sour cream', TRUE, NOW(), NOW()),
(52, 'Condensed Milk', 140.00, 155.00, 'g', 400.00, 3, 2, 12.00, TRUE, FALSE, FALSE, '🥛', 0.0, 0, 50, 10, 'Milkmaid', TRUE, NOW(), NOW()),
(53, 'Soya Milk', 95.00, 105.00, 'ltr', 1.00, 3, NULL, 5.00, TRUE, FALSE, FALSE, '🥛', 0.0, 0, 40, 10, 'Soya milk', TRUE, NOW(), NOW()),
(54, 'Almond Milk', 240.00, 270.00, 'ltr', 1.00, 3, NULL, 5.00, TRUE, FALSE, FALSE, '🥛', 0.0, 0, 25, 11, 'Almond milk', TRUE, NOW(), NOW()),

-- Snacks (corrected: Branded Biscuits 18%, Chocolate 18%, Chips 12%, Packaged Namkeen/Popcorn 12%, Dry Fruits 12%)
(17, 'Cookies', 95.00, 115.00, 'g', 250.00, 4, 3, 18.00, TRUE, FALSE, FALSE, '🍪', 0.0, 0, 80, 17, 'Good Day cookies', TRUE, NOW(), NOW()),
(18, 'Chips', 45.00, 55.00, 'g', 90.00, 4, 4, 12.00, TRUE, FALSE, FALSE, '🥔', 0.0, 0, 120, 18, 'Lay''s classic', TRUE, NOW(), NOW()),
(19, 'Chocolate', 110.00, 130.00, 'g', 100.00, 4, 5, 18.00, TRUE, FALSE, FALSE, '🍫', 0.0, 0, 60, 15, 'Dairy Milk', TRUE, NOW(), NOW()),
(20, 'Popcorn', 60.00, 70.00, 'g', 100.00, 4, NULL, 12.00, TRUE, FALSE, FALSE, '🍿', 0.0, 0, 90, 14, 'Microwave popcorn', TRUE, NOW(), NOW()),
(55, 'Almonds', 920.00, 1120.00, 'kg', 1.00, 4, 6, 12.00, TRUE, FALSE, FALSE, '🥜', 0.0, 0, 50, 18, 'Premium almonds', TRUE, NOW(), NOW()),
(56, 'Cashews', 820.00, 1000.00, 'kg', 1.00, 4, 7, 12.00, TRUE, FALSE, FALSE, '🥜', 0.0, 0, 45, 18, 'Whole cashews', TRUE, NOW(), NOW()),
(57, 'Walnuts', 680.00, 850.00, 'kg', 1.00, 4, 6, 12.00, TRUE, FALSE, FALSE, '🥜', 0.0, 0, 40, 20, 'California walnuts', TRUE, NOW(), NOW()),
(58, 'Raisins', 280.00, 340.00, 'g', 500.00, 4, 7, 12.00, TRUE, FALSE, FALSE, '🍇', 0.0, 0, 70, 18, 'Golden raisins', TRUE, NOW(), NOW()),
(59, 'Granola', 260.00, 300.00, 'g', 500.00, 4, NULL, 12.00, TRUE, FALSE, FALSE, '🥣', 0.0, 0, 30, 13, 'Nut granola', TRUE, NOW(), NOW()),
(60, 'Trail Mix', 240.00, 280.00, 'g', 250.00, 4, NULL, 12.00, TRUE, FALSE, FALSE, '🥜', 0.0, 0, 45, 14, 'Mixed trail mix', TRUE, NOW(), NOW()),
(61, 'Pretzels', 115.00, 135.00, 'g', 200.00, 4, NULL, 12.00, TRUE, FALSE, FALSE, '🥨', 0.0, 0, 60, 15, 'Salted pretzels', TRUE, NOW(), NOW()),
(62, 'Nachos', 105.00, 125.00, 'g', 200.00, 4, NULL, 12.00, TRUE, FALSE, FALSE, '🌮', 0.0, 0, 70, 16, 'Corn nachos', TRUE, NOW(), NOW()),
(63, 'Peanuts', 70.00, 85.00, 'g', 500.00, 4, NULL, 12.00, TRUE, FALSE, FALSE, '🥜', 0.0, 0, 100, 18, 'Roasted peanuts', TRUE, NOW(), NOW()),
(64, 'Pistachios', 950.00, 1150.00, 'kg', 1.00, 4, 7, 12.00, TRUE, FALSE, FALSE, '🥜', 0.0, 0, 35, 17, 'Premium pistachios', TRUE, NOW(), NOW()),

-- Beverages (unchanged from previous, as no complaints)
(21, 'Orange Juice', 115.00, 135.00, 'ltr', 1.00, 5, 9, 12.00, TRUE, FALSE, FALSE, '🧃', 0.0, 0, 60, 15, 'Real orange juice', TRUE, NOW(), NOW()),
(22, 'Coffee', 360.00, 410.00, 'g', 200.00, 5, 11, 5.00, TRUE, FALSE, FALSE, '☕', 0.0, 0, 40, 12, 'Nescafe Classic', TRUE, NOW(), NOW()),
(23, 'Tea', 460.00, 510.00, 'kg', 1.00, 5, 10, 5.00, TRUE, FALSE, FALSE, '🍵', 0.0, 0, 70, 10, 'Red Label tea', TRUE, NOW(), NOW()),
(24, 'Soda', 38.00, 42.00, 'ml', 750.00, 5, NULL, 28.00, TRUE, FALSE, FALSE, '🥤', 0.0, 0, 100, 10, 'Coca-Cola PET', FALSE, NOW(), NOW()),
(65, 'Mango Juice', 110.00, 130.00, 'ltr', 1.00, 5, 8, 12.00, TRUE, FALSE, FALSE, '🥭', 0.0, 0, 65, 15, 'Maaza mango drink', TRUE, NOW(), NOW()),
(66, 'Apple Juice', 120.00, 140.00, 'ltr', 1.00, 5, 8, 12.00, TRUE, FALSE, FALSE, '🍎', 0.0, 0, 55, 14, 'Real apple juice', TRUE, NOW(), NOW()),
(67, 'Cranberry Juice', 180.00, 210.00, 'ltr', 1.00, 5, 9, 12.00, TRUE, FALSE, FALSE, '🥤', 0.0, 0, 30, 14, 'Cranberry juice', TRUE, NOW(), NOW()),
(68, 'Green Tea', 280.00, 320.00, 'g', 100.00, 5, NULL, 5.00, TRUE, FALSE, FALSE, '🍵', 0.0, 0, 50, 13, 'Green tea bags', TRUE, NOW(), NOW()),
(69, 'Energy Drink', 20.00, 25.00, 'ml', 250.00, 5, NULL, 28.00, TRUE, FALSE, FALSE, '⚡', 0.0, 0, 120, 20, 'Sting energy', TRUE, NOW(), NOW()),
(70, 'Coconut Water', 92.00, 110.00, 'ltr', 1.00, 5, NULL, 12.00, TRUE, FALSE, FALSE, '🥥', 0.0, 0, 80, 16, 'Packaged coconut water', TRUE, NOW(), NOW()),
(71, 'Smoothie', 140.00, 160.00, 'ml', 300.00, 5, NULL, 12.00, TRUE, FALSE, FALSE, '🥤', 0.0, 0, 35, 13, 'Mixed fruit smoothie', TRUE, NOW(), NOW()),
(72, 'Milkshake', 85.00, 95.00, 'ml', 200.00, 5, NULL, 12.00, TRUE, FALSE, FALSE, '🥤', 0.0, 0, 50, 11, 'Chocolate milkshake', TRUE, NOW(), NOW()),
(73, 'Lemonade', 50.00, 60.00, 'ltr', 1.00, 5, NULL, 12.00, TRUE, FALSE, FALSE, '🍋', 0.0, 0, 80, 17, 'Packaged lemonade', TRUE, NOW(), NOW()),
(74, 'Hot Chocolate', 180.00, 210.00, 'g', 200.00, 5, NULL, 5.00, TRUE, FALSE, FALSE, '☕', 0.0, 0, 40, 14, 'Hot cocoa powder', TRUE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price, mrp = EXCLUDED.mrp, unit = EXCLUDED.unit, pack_size = EXCLUDED.pack_size,
    brand_id = EXCLUDED.brand_id, gst_rate = EXCLUDED.gst_rate, is_fresh = EXCLUDED.is_fresh,
    discount_percent = EXCLUDED.discount_percent, rating = 0.0, reviews_count = 0,
    updated_at = NOW();

-- COUPONS
INSERT INTO coupons (code, description, coupon_type, value, min_order_value, max_discount, applicable_categories, first_order_only, is_active, valid_from, valid_until, created_at)
VALUES
('SAVE20', '20% off orders above ₹500', 'percentage', 20.00, 500.00, 120.00, '[]'::jsonb, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW()),
('FRESH15', '15% off fruits & vegetables', 'category', 15.00, 200.00, 80.00, '["Fruits","Vegetables"]'::jsonb, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW()),
('WELCOME50', '₹50 off first order', 'fixed', 50.00, 300.00, 50.00, '[]'::jsonb, TRUE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW()),
('DAIRY10', '10% off dairy', 'category', 10.00, 150.00, 60.00, '["Dairy"]'::jsonb, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW()),
('SNACKS25', '₹25 off snacks', 'fixed', 25.00, 100.00, 25.00, '["Snacks"]'::jsonb, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW()),
('SUMMER10', '10% off above ₹400', 'percentage', 10.00, 400.00, 60.00, '[]'::jsonb, FALSE, TRUE, NOW(), NOW() + INTERVAL '6 months', NOW()),
('FLAT50', 'Flat ₹50 off above ₹500', 'fixed', 50.00, 500.00, NULL, '[]'::jsonb, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW()),
('BEV15', '15% off beverages', 'category', 15.00, 200.00, 40.00, '["Beverages"]'::jsonb, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW()),
('AHMEDABAD20', '20% off Ahmedabad orders > ₹400', 'percentage', 20.00, 400.00, 100.00, '[]'::jsonb, FALSE, TRUE, NOW(), NOW() + INTERVAL '6 months', NOW()),
('GROCERY15', '15% off groceries > ₹600', 'percentage', 15.00, 600.00, 120.00, '[]'::jsonb, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year', NOW())
ON CONFLICT (code) DO NOTHING;

-- SITE SETTINGS
INSERT INTO site_settings (id, tax_rate, standard_delivery_charge, express_delivery_charge, free_delivery_threshold, site_name, site_currency, created_at, updated_at)
VALUES (1, 0.00, 35.00, 49.00, 499.00, 'HappyGroceries', '₹', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- SORT OPTIONS
INSERT INTO sort_options (value, label, "order", is_active) VALUES
('popular', 'Most Popular', 1, TRUE),
('price_low', 'Price: Low to High', 2, TRUE),
('price_high', 'Price: High to Low', 3, TRUE),
('rating', 'Highest Rated', 4, TRUE),
('newest', 'Newest First', 5, TRUE)
ON CONFLICT (value) DO NOTHING;
