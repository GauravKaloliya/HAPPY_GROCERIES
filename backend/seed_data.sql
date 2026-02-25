-- =====================================================
-- SEED DATA — Categories + Products + Coupons only
-- Prices updated to realistic 2025–2026 Indian market (₹/kg or unit)
-- All products: rating = 0.0, reviews_count = 0
-- Added 8 more coupons (total 13) — common Indian grocery style
-- =====================================================

-- 1. Categories (5) — unchanged
INSERT INTO categories (name, description, emoji, created_at, is_deleted, deleted_at)
VALUES
('Fruits', 'Fresh fruits from local farms', '🍎', NOW(), false, NULL),
('Vegetables', 'Fresh vegetables for a healthy diet', '🥕', NOW(), false, NULL),
('Dairy', 'Dairy products including milk, cheese, and more', '🥛', NOW(), false, NULL),
('Snacks', 'Delicious snacks for every mood', '🍪', NOW(), false, NULL),
('Beverages', 'Refreshing drinks and beverages', '🧃', NOW(), false, NULL)
ON CONFLICT (name) DO UPDATE SET
description = EXCLUDED.description,
emoji = EXCLUDED.emoji,
is_deleted = false,
deleted_at = NULL;

-- 2. Products (74) — realistic Indian prices (per kg/unit), rating/reviews = 0
DO $$
DECLARE
fruits INT := (SELECT id FROM categories WHERE name = 'Fruits');
vegetables INT := (SELECT id FROM categories WHERE name = 'Vegetables');
dairy INT := (SELECT id FROM categories WHERE name = 'Dairy');
snacks INT := (SELECT id FROM categories WHERE name = 'Snacks');
beverages INT := (SELECT id FROM categories WHERE name = 'Beverages');
BEGIN
INSERT INTO products (
id, name, price, category_id, emoji, rating, reviews_count, stock,
discount_percent, description, is_active,
created_at, updated_at, is_deleted, deleted_at
) VALUES

-- Fruits (16) — ₹40–180/kg range
(1,  'Apple',       120.00, fruits, '🍎',  0.0, 0, 25, 10, 'Crisp, juicy apples packed with fiber and natural sweetness.', true, NOW(), NOW(), false, NULL),
(2,  'Banana',       50.00, fruits, '🍌',  0.0, 0, 40,  5, 'Naturally sweet bananas rich in potassium.', true, NOW(), NOW(), false, NULL),
(3,  'Orange',       80.00, fruits, '🍊',  0.0, 0, 30, 10, 'Fresh oranges bursting with vitamin C.', true, NOW(), NOW(), false, NULL),
(4,  'Grapes',      100.00, fruits, '🍇',  0.0, 0, 18, 15, 'Sweet, seedless grapes perfect for snacking.', true, NOW(), NOW(), false, NULL),
(5,  'Strawberry',  180.00, fruits, '🍓',  0.0, 0, 10, 20, 'Bright, fragrant strawberries with sweet-tart taste.', true, NOW(), NOW(), false, NULL),
(6,  'Watermelon',   40.00, fruits, '🍉',  0.0, 0, 12, 10, 'Refreshing watermelon—great for summer hydration.', true, NOW(), NOW(), false, NULL),
(25, 'Mango',       120.00, fruits, '🥭',  0.0, 0, 20, 15, 'Sweet and juicy Alphonso mangoes.', true, NOW(), NOW(), false, NULL),
(26, 'Pineapple',    90.00, fruits, '🍍',  0.0, 0, 15, 10, 'Tropical pineapples with sweet and tangy flavor.', true, NOW(), NOW(), false, NULL),
(27, 'Kiwi',        150.00, fruits, '🥝',  0.0, 0, 25,  0, 'Tangy and vitamin-rich kiwis.', true, NOW(), NOW(), false, NULL),
(28, 'Papaya',       60.00, fruits, '🍈',  0.0, 0, 18, 10, 'Ripe and sweet papayas.', true, NOW(), NOW(), false, NULL),
(29, 'Guava',        70.00, fruits, '🍈',  0.0, 0, 30, 10, 'Fresh pink guavas, full of vitamin C.', true, NOW(), NOW(), false, NULL),
(30, 'Pomegranate', 140.00, fruits, '🍎',  0.0, 0, 12,  0, 'Juicy red pomegranate pearls.', true, NOW(), NOW(), false, NULL),
(31, 'Blueberry',   300.00, fruits, '🫐',  0.0, 0, 10,  0, 'Premium fresh blueberries.', true, NOW(), NOW(), false, NULL),
(32, 'Peach',       180.00, fruits, '🍑',  0.0, 0, 14,  0, 'Soft and sweet peaches.', true, NOW(), NOW(), false, NULL),
(33, 'Cherry',      400.00, fruits, '🍒',  0.0, 0,  8,  0, 'Sweet red cherries (seasonal).', true, NOW(), NOW(), false, NULL),
(34, 'Avocado',     200.00, fruits, '🥑',  0.0, 0, 12,  0, 'Creamy ripe avocados.', true, NOW(), NOW(), false, NULL),

-- Vegetables (16) — ₹20–100/kg
(7,  'Carrot',      40.00, vegetables, '🥕', 0.0, 0, 35, 10, 'Crunchy carrots rich in beta-carotene.', true, NOW(), NOW(), false, NULL),
(8,  'Tomato',      35.00, vegetables, '🍅', 0.0, 0, 28, 10, 'Juicy tomatoes — kitchen staple.', true, NOW(), NOW(), false, NULL),
(9,  'Broccoli',    80.00, vegetables, '🥦', 0.0, 0, 16, 15, 'Fresh broccoli florets loaded with nutrients.', true, NOW(), NOW(), false, NULL),
(10, 'Cucumber',    30.00, vegetables, '🥒', 0.0, 0, 22, 10, 'Cool and crisp cucumbers.', true, NOW(), NOW(), false, NULL),
(11, 'Potato',      25.00, vegetables, '🥔', 0.0, 0, 50,  5, 'Versatile potatoes for everyday cooking.', true, NOW(), NOW(), false, NULL),
(12, 'Corn',        50.00, vegetables, '🌽', 0.0, 0, 20, 10, 'Sweet corn — great boiled or grilled.', true, NOW(), NOW(), false, NULL),
(35, 'Spinach',     40.00, vegetables, '🥬', 0.0, 0, 40, 10, 'Fresh green spinach leaves.', true, NOW(), NOW(), false, NULL),
(36, 'Cauliflower', 50.00, vegetables, '🥦', 0.0, 0, 22, 10, 'Fresh white cauliflower florets.', true, NOW(), NOW(), false, NULL),
(37, 'Cabbage',     30.00, vegetables, '🥬', 0.0, 0, 25, 10, 'Crunchy green cabbage.', true, NOW(), NOW(), false, NULL),
(38, 'Onion',       40.00, vegetables, '🧅', 0.0, 0, 100,  5, 'Essential red onions.', true, NOW(), NOW(), false, NULL),
(39, 'Garlic',      120.00, vegetables, '🧄', 0.0, 0, 60,  5, 'Pungent and flavorful garlic cloves.', true, NOW(), NOW(), false, NULL),
(40, 'Bell Pepper', 80.00, vegetables, '🫑', 0.0, 0, 15, 10, 'Vibrant bell peppers.', true, NOW(), NOW(), false, NULL),
(41, 'Sweet Potato',60.00, vegetables, '🍠', 0.0, 0, 30, 10, 'Nutritious sweet potatoes.', true, NOW(), NOW(), false, NULL),
(42, 'Peas',        90.00, vegetables, '🫛', 0.0, 0, 20, 10, 'Fresh green peas.', true, NOW(), NOW(), false, NULL),
(43, 'Beans',       60.00, vegetables, '🫛', 0.0, 0, 25, 10, 'Fresh green beans.', true, NOW(), NOW(), false, NULL),
(44, 'Mushrooms',  120.00, vegetables, '🍄', 0.0, 0, 12,  0, 'Fresh button mushrooms.', true, NOW(), NOW(), false, NULL),

-- Dairy (14) — realistic packs/units
(13, 'Milk',         65.00, dairy, '🥛', 0.0, 0, 24,  5, 'Fresh, creamy milk (1L).', true, NOW(), NOW(), false, NULL),
(14, 'Cheese',      180.00, dairy, '🧀', 0.0, 0, 14, 10, 'Rich processed cheese (200g).', true, NOW(), NOW(), false, NULL),
(15, 'Butter',      220.00, dairy, '🧈', 0.0, 0,  9,  5, 'Creamy butter (500g).', true, NOW(), NOW(), false, NULL),
(16, 'Yogurt',       70.00, dairy, '🥛', 0.0, 0, 18,  5, 'Smooth curd/yogurt (400g).', true, NOW(), NOW(), false, NULL),
(45, 'Paneer',      150.00, dairy, '🧀', 0.0, 0, 18, 10, 'Fresh soft paneer (200g).', true, NOW(), NOW(), false, NULL),
(46, 'Ghee',        650.00, dairy, '🧈', 0.0, 0, 15,  5, 'Pure cow ghee (1L).', true, NOW(), NOW(), false, NULL),
(47, 'Ice Cream',   150.00, dairy, '🍦', 0.0, 0, 10, 15, 'Creamy vanilla ice cream (1L).', true, NOW(), NOW(), false, NULL),
(48, 'Buttermilk',   25.00, dairy, '🥛', 0.0, 0, 40,  5, 'Refreshing buttermilk (1L).', true, NOW(), NOW(), false, NULL),
(49, 'Flavored Yogurt', 90.00, dairy, '🥛', 0.0, 0, 25, 10, 'Fruit-flavored yogurt (400g).', true, NOW(), NOW(), false, NULL),
(50, 'Whipped Cream',180.00, dairy, '🥛', 0.0, 0, 12,  0, 'Light whipped cream (200g).', true, NOW(), NOW(), false, NULL),
(51, 'Sour Cream',  140.00, dairy, '🥛', 0.0, 0, 15,  0, 'Tangy sour cream (200g).', true, NOW(), NOW(), false, NULL),
(52, 'Condensed Milk', 120.00, dairy, '🥛', 0.0, 0, 20,  5, 'Sweetened condensed milk (400g).', true, NOW(), NOW(), false, NULL),
(53, 'Soya Milk',    80.00, dairy, '🥛', 0.0, 0, 18, 10, 'Plant-based soya milk (1L).', true, NOW(), NOW(), false, NULL),
(54, 'Almond Milk', 140.00, dairy, '🥛', 0.0, 0, 14,  0, 'Creamy almond milk (1L).', true, NOW(), NOW(), false, NULL),

-- Snacks (14) — packs ₹50–400
(17, 'Cookies',      90.00, snacks, '🍪', 0.0, 0, 32, 15, 'Crunchy cookies (pack).', true, NOW(), NOW(), false, NULL),
(18, 'Chips',        40.00, snacks, '🥔', 0.0, 0, 45, 20, 'Crispy salty chips (pack).', true, NOW(), NOW(), false, NULL),
(19, 'Chocolate',   100.00, snacks, '🍫', 0.0, 0, 27, 20, 'Smooth indulgent chocolate (bar/pack).', true, NOW(), NOW(), false, NULL),
(20, 'Popcorn',      60.00, snacks, '🍿', 0.0, 0, 38, 25, 'Light fluffy popcorn (pack).', true, NOW(), NOW(), false, NULL),
(55, 'Almonds',     350.00, snacks, '🥜', 0.0, 0, 30, 10, 'Premium roasted almonds (500g).', true, NOW(), NOW(), false, NULL),
(56, 'Cashews',     450.00, snacks, '🥜', 0.0, 0, 25, 10, 'Creamy cashew nuts (500g).', true, NOW(), NOW(), false, NULL),
(57, 'Walnuts',     500.00, snacks, '🥜', 0.0, 0, 20, 15, 'Healthy walnuts (500g).', true, NOW(), NOW(), false, NULL),
(58, 'Raisins',     120.00, snacks, '🍇', 0.0, 0, 35, 10, 'Sweet chewy raisins (500g).', true, NOW(), NOW(), false, NULL),
(59, 'Granola',     200.00, snacks, '🥣', 0.0, 0, 15, 15, 'Crunchy granola with nuts (400g).', true, NOW(), NOW(), false, NULL),
(60, 'Trail Mix',   250.00, snacks, '🥜', 0.0, 0, 20, 15, 'Mix of nuts & dried fruits (400g).', true, NOW(), NOW(), false, NULL),
(61, 'Pretzels',    120.00, snacks, '🥨', 0.0, 0, 40, 20, 'Salted pretzels (pack).', true, NOW(), NOW(), false, NULL),
(62, 'Nachos',      100.00, snacks, '🌮', 0.0, 0, 30, 15, 'Crispy corn nachos (pack).', true, NOW(), NOW(), false, NULL),
(63, 'Peanuts',      80.00, snacks, '🥜', 0.0, 0, 50, 10, 'Roasted salted peanuts (500g).', true, NOW(), NOW(), false, NULL),
(64, 'Pistachios',  550.00, snacks, '🥜', 0.0, 0, 18,  0, 'Roasted pistachios (500g).', true, NOW(), NOW(), false, NULL),

-- Beverages (14) — ₹30–150
(21, 'Orange Juice',  80.00, beverages, '🧃', 0.0, 0, 20, 10, 'Refreshing orange juice (1L).', true, NOW(), NOW(), false, NULL),
(22, 'Coffee',       180.00, beverages, '☕', 0.0, 0, 15, 15, 'Aromatic instant coffee (100g).', true, NOW(), NOW(), false, NULL),
(23, 'Tea',          120.00, beverages, '🍵', 0.0, 0, 22, 10, 'Premium tea leaves (500g).', true, NOW(), NOW(), false, NULL),
(24, 'Soda',          40.00, beverages, '🥤', 0.0, 0,  0,  0, 'Classic fizzy soda (600ml).', false, NOW(), NOW(), false, NULL),
(65, 'Mango Juice',   70.00, beverages, '🥭', 0.0, 0, 25, 10, 'Sweet mango nectar (1L).', true, NOW(), NOW(), false, NULL),
(66, 'Apple Juice',   80.00, beverages, '🍎', 0.0, 0, 22, 10, 'Refreshing apple juice (1L).', true, NOW(), NOW(), false, NULL),
(67, 'Cranberry Juice',120.00,beverages,'🥤', 0.0, 0, 15,  0, 'Tart cranberry juice (1L).', true, NOW(), NOW(), false, NULL),
(68, 'Green Tea',    150.00, beverages, '🍵', 0.0, 0, 30, 15, 'Healthy green tea (100 bags).', true, NOW(), NOW(), false, NULL),
(69, 'Energy Drink', 100.00, beverages, '⚡', 0.0, 0, 40, 20, 'Instant energy drink (250ml).', true, NOW(), NOW(), false, NULL),
(70, 'Coconut Water', 50.00, beverages, '🥥', 0.0, 0, 50, 10, 'Natural coconut water (1L).', true, NOW(), NOW(), false, NULL),
(71, 'Smoothie',     120.00, beverages, '🥤', 0.0, 0, 12, 15, 'Mixed fruit smoothie (300ml).', true, NOW(), NOW(), false, NULL),
(72, 'Milkshake',    100.00, beverages, '🥤', 0.0, 0, 15, 10, 'Creamy chocolate milkshake (300ml).', true, NOW(), NOW(), false, NULL),
(73, 'Lemonade',      35.00, beverages, '🍋', 0.0, 0, 45, 10, 'Zesty lemonade (600ml).', true, NOW(), NOW(), false, NULL),
(74, 'Hot Chocolate', 90.00, beverages, '☕', 0.0, 0, 20,  5, 'Rich hot chocolate mix (200g).', true, NOW(), NOW(), false, NULL)

ON CONFLICT (id) DO UPDATE SET
    name             = EXCLUDED.name,
    price            = EXCLUDED.price,
    category_id      = EXCLUDED.category_id,
    emoji            = EXCLUDED.emoji,
    rating           = EXCLUDED.rating,
    reviews_count    = EXCLUDED.reviews_count,
    stock            = EXCLUDED.stock,
    discount_percent = EXCLUDED.discount_percent,
    description      = EXCLUDED.description,
    is_active        = EXCLUDED.is_active,
    updated_at       = NOW(),
    is_deleted       = false,
    deleted_at       = NULL;
END $$;

-- 3. Coupons (13 total — original 5 + 8 new realistic ones)
INSERT INTO coupons (
code, description, coupon_type, value, min_order_value, max_discount,
applicable_categories, first_order_only, usage_limit, usage_count,
is_active, valid_from, valid_until, created_at, is_deleted, deleted_at
) VALUES
-- Original 5
('SAVE20', '20% off orders above ₹500', 'percentage', 20.00, 500.00, 150.00, '[]'::jsonb, false, NULL, 0, true, NOW() - INTERVAL '30 days', NOW() + INTERVAL '1 year', NOW(), false, NULL),
('FRESH15', '15% off on fruits & vegetables', 'category', 15.00, 200.00, 100.00, '["Fruits", "Vegetables"]'::jsonb, false, NULL, 0, true, NOW(), NOW() + INTERVAL '1 year', NOW(), false, NULL),
('WELCOME50','₹50 off first order', 'fixed', 50.00, 300.00, 50.00, '[]'::jsonb, true, NULL, 0, true, NOW(), NOW() + INTERVAL '1 year', NOW(), false, NULL),
('DAIRY10', '10% off on dairy products', 'category', 10.00, 150.00, 80.00, '["Dairy"]'::jsonb, false, NULL, 0, true, NOW(), NOW() + INTERVAL '1 year', NOW(), false, NULL),
('SNACKS25', '₹25 off on snacks orders', 'fixed', 25.00, 100.00, 25.00, '["Snacks"]'::jsonb, false, NULL, 0, true, NOW(), NOW() + INTERVAL '1 year', NOW(), false, NULL),

-- New 8 realistic Indian grocery coupons (inspired by BigBasket/Blinkit/JioMart/Zepto style)
('FIRST100', '₹100 off on first order above ₹399', 'fixed',     100.00, 399.00, 100.00, '[]'::jsonb,                true,  NULL, 0, true, NOW(), NOW() + INTERVAL '6 months', NOW(), false, NULL),
('QUICK20',  '20% off on quick delivery orders',  'percentage', 20.00, 200.00,  80.00, '[]'::jsonb,                false, NULL, 0, true, NOW(), NOW() + INTERVAL '3 months', NOW(), false, NULL),
('VEG30',    '30% off on fresh vegetables',       'category',   30.00, 150.00,  90.00, '["Vegetables"]'::jsonb,    false, 5,    0, true, NOW(), NOW() + INTERVAL '2 months', NOW(), false, NULL),
('MILK5OFF', '₹5 off per liter milk (max 4L)',    'fixed',       5.00, 100.00,  20.00, '["Dairy"]'::jsonb,         false, NULL, 0, true, NOW(), NOW() + INTERVAL '1 month', NOW(), false, NULL),
('FRUITFLAT','Flat ₹75 off on fruits above ₹300','fixed',      75.00, 300.00,  75.00, '["Fruits"]'::jsonb,        false, NULL, 0, true, NOW(), NOW() + INTERVAL '1 year', NOW(), false, NULL),
('WEEKEND',  '25% off entire order (weekend only)','percentage',25.00, 400.00, 150.00, '[]'::jsonb,                false, NULL, 0, true, NOW(), NOW() + INTERVAL '1 year', NOW(), false, NULL),
('NEWUSER75','₹75 off for new users above ₹250',  'fixed',      75.00, 250.00,  75.00, '[]'::jsonb,                true,  NULL, 0, true, NOW(), NOW() + INTERVAL '1 year', NOW(), false, NULL),
('BEVBUY2',  'Buy 2 beverages get 1 free (up to ₹80)', 'percentage',33.33, 150.00,  80.00, '["Beverages"]'::jsonb,     false, NULL, 0, true, NOW(), NOW() + INTERVAL '6 months', NOW(), false, NULL)

ON CONFLICT (code) DO UPDATE SET
description = EXCLUDED.description,
coupon_type = EXCLUDED.coupon_type,
value = EXCLUDED.value,
min_order_value = EXCLUDED.min_order_value,
max_discount = EXCLUDED.max_discount,
applicable_categories = EXCLUDED.applicable_categories,
first_order_only = EXCLUDED.first_order_only,
is_active = EXCLUDED.is_active,
valid_from = EXCLUDED.valid_from,
valid_until = EXCLUDED.valid_until,
updated_at = NOW(),
is_deleted = false,
deleted_at = NULL;
