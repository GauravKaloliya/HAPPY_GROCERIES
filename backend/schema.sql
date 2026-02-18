-- Happy Groceries Database Schema
-- PostgreSQL 14+ compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    username VARCHAR(150) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL DEFAULT '',
    last_name VARCHAR(150) NOT NULL DEFAULT '',
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    phone VARCHAR(10) NOT NULL UNIQUE,
    email VARCHAR(254),
    avatar VARCHAR(100),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX users_phone_idx ON users(phone);
CREATE INDEX users_username_idx ON users(username);

-- =====================================================
-- CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    emoji VARCHAR(10) NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX categories_name_idx ON categories(name);

-- =====================================================
-- PRODUCTS
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
    emoji VARCHAR(10) NOT NULL DEFAULT '',
    rating DECIMAL(2, 1) NOT NULL DEFAULT 4.0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    description TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX products_name_idx ON products(name);
CREATE INDEX products_category_is_active_idx ON products(category_id, is_active);

-- =====================================================
-- CARTS
-- =====================================================

CREATE TABLE IF NOT EXISTS carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX carts_user_idx ON carts(user_id);

-- =====================================================
-- CART ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(cart_id, product_id)
);

CREATE INDEX cart_items_cart_idx ON cart_items(cart_id);
CREATE INDEX cart_items_product_idx ON cart_items(product_id);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    order_id VARCHAR(20) NOT NULL UNIQUE CHECK (order_id ~ '^HG[0-9]{8}$'),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'paid', 'failed', 'refunded')),
    payment_reference VARCHAR(100),
    delivery_type VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (delivery_type IN ('standard', 'express')),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax DECIMAL(10, 2) NOT NULL CHECK (tax >= 0),
    delivery_charge DECIMAL(10, 2) NOT NULL CHECK (delivery_charge >= 0),
    coupon_discount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (coupon_discount >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    delivery_name VARCHAR(100) NOT NULL,
    delivery_phone VARCHAR(10) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_instructions TEXT NOT NULL DEFAULT '',
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_order_id_idx ON orders(order_id);
CREATE INDEX orders_user_idx ON orders(user_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_user_created_idx ON orders(user_id, created_at DESC);

-- =====================================================
-- ORDER ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    product_id INTEGER REFERENCES products(id) ON DELETE PROTECT DEFERRABLE INITIALLY DEFERRED,
    product_name VARCHAR(100) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL CHECK (product_price >= 0),
    product_emoji VARCHAR(10) NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX order_items_order_idx ON order_items(order_id);
CREATE INDEX order_items_product_idx ON order_items(product_id);

-- =====================================================
-- COUPONS
-- =====================================================

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    coupon_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (coupon_type IN ('percentage', 'fixed', 'category')),
    value DECIMAL(5, 2) NOT NULL CHECK (value >= 0),
    min_order_value DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
    max_discount DECIMAL(10, 2) CHECK (max_discount IS NULL OR max_discount >= 0),
    applicable_categories JSONB NOT NULL DEFAULT '[]',
    first_order_only BOOLEAN NOT NULL DEFAULT FALSE,
    usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit >= 0),
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX coupons_code_idx ON coupons(code);
CREATE INDEX coupons_is_active_idx ON coupons(is_active);
CREATE INDEX coupons_active_valid_idx ON coupons(is_active, valid_until);
CREATE INDEX coupons_categories_gin ON coupons USING GIN (applicable_categories);

-- =====================================================
-- COUPON USAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS coupon_usages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    discount_amount DECIMAL(10, 2) NOT NULL CHECK (discount_amount >= 0),
    used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX coupon_usages_user_idx ON coupon_usages(user_id);
CREATE INDEX coupon_usages_coupon_idx ON coupon_usages(coupon_id);
CREATE INDEX coupon_usages_order_idx ON coupon_usages(order_id);

-- =====================================================
-- AUTOMATED UPDATE TRIGGERS FOR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to products table
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to carts table
CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to orders table
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Matching Legacy System)
-- =====================================================

-- Insert default categories (5 categories matching legacy system)
INSERT INTO categories (name, description, emoji) VALUES
    ('Fruits', 'Fresh fruits from local farms', '🍎'),
    ('Vegetables', 'Fresh vegetables for a healthy diet', '🥕'),
    ('Dairy', 'Dairy products including milk, cheese, and more', '🥛'),
    ('Snacks', 'Delicious snacks for every mood', '🍪'),
    ('Beverages', 'Refreshing drinks and beverages', '🧃')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PRODUCTS (74 products matching legacy system exactly)
-- =====================================================

-- FRUITS (16 products)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description, is_active) VALUES
    (1, 'Apple', 50.00, 1, '🍎', 4.5, 128, 25, 15, 'Crisp, juicy apples packed with fiber and natural sweetness. Perfect for snacking, salads, and fresh juice.', TRUE),
    (2, 'Banana', 30.00, 1, '🍌', 4.2, 94, 40, 20, 'Naturally sweet bananas rich in potassium. Great for smoothies, breakfast bowls, and quick energy.', TRUE),
    (3, 'Orange', 40.00, 1, '🍊', 4.3, 76, 30, 18, 'Fresh oranges bursting with vitamin C. Enjoy as a snack or squeeze for a refreshing juice.', TRUE),
    (4, 'Grapes', 80.00, 1, '🍇', 4.6, 62, 18, 25, 'Sweet, seedless grapes that are perfect for snacking and fruit platters. Chill for extra freshness.', TRUE),
    (5, 'Strawberry', 120.00, 1, '🍓', 4.8, 141, 10, 30, 'Bright, fragrant strawberries with a sweet-tart taste. Best for desserts, toppings, and smoothies.', TRUE),
    (6, 'Watermelon', 60.00, 1, '🍉', 4.4, 58, 12, 12, 'Refreshing watermelon with a high water content—great for summer hydration and fruit salads.', TRUE),
    (25, 'Mango', 100.00, 1, '🥭', 4.7, 115, 20, 25, 'Sweet and juicy Alphonso mangoes, known as the king of fruits.', TRUE),
    (26, 'Pineapple', 80.00, 1, '🍍', 4.5, 82, 15, 20, 'Tropical pineapples with a sweet and tangy flavor. Great for desserts and juices.', TRUE),
    (27, 'Kiwi', 120.00, 1, '🥝', 4.6, 64, 25, 0, 'Tangy and vitamin-rich kiwis with a unique flavor and vibrant green flesh.', TRUE),
    (28, 'Papaya', 50.00, 1, '🍈', 4.2, 45, 18, 18, 'Ripe and sweet papayas, perfect for a healthy breakfast or snack.', TRUE),
    (29, 'Guava', 40.00, 1, '🍈', 4.1, 38, 30, 22, 'Fresh pink guavas, crunchy and full of vitamin C. Great with a pinch of salt and chili.', TRUE),
    (30, 'Pomegranate', 150.00, 1, '🍎', 4.8, 92, 12, 0, 'Juicy red pomegranate pearls, packed with antioxidants and sweet-tart flavor.', TRUE),
    (31, 'Blueberry', 300.00, 1, '🫐', 4.9, 156, 10, 0, 'Premium fresh blueberries, perfect for smoothies, pancakes, or healthy snacking.', TRUE),
    (32, 'Peach', 180.00, 1, '🍑', 4.4, 53, 14, 0, 'Soft and sweet peaches with a delicate aroma. Ideal for desserts and salads.', TRUE),
    (33, 'Cherry', 250.00, 1, '🍒', 4.7, 124, 8, 0, 'Sweet red cherries, a perfect seasonal treat for snacking or baking.', TRUE),
    (34, 'Avocado', 200.00, 1, '🥑', 4.3, 89, 12, 0, 'Creamy ripe avocados, perfect for toast, salads, and healthy fats.', TRUE);

-- VEGETABLES (14 products)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description, is_active) VALUES
    (7, 'Carrot', 30.00, 2, '🥕', 4.0, 44, 35, 20, 'Crunchy carrots rich in beta-carotene. Ideal for salads, soups, and healthy snacking.', TRUE),
    (8, 'Tomato', 25.00, 2, '🍅', 4.1, 52, 28, 15, 'Juicy tomatoes that add flavor to curries, sandwiches, and salads. A kitchen staple!', TRUE),
    (9, 'Broccoli', 45.00, 2, '🥦', 4.2, 39, 16, 18, 'Fresh broccoli florets loaded with nutrients. Steam, stir-fry, or roast for a delicious side.', TRUE),
    (10, 'Cucumber', 35.00, 2, '🥒', 3.9, 31, 22, 22, 'Cool and crisp cucumbers—perfect for salads, raita, and refreshing hydration.', TRUE),
    (11, 'Potato', 20.00, 2, '🥔', 4.0, 67, 50, 10, 'Versatile potatoes for curries, fries, and snacks. A must-have for everyday cooking.', TRUE),
    (12, 'Corn', 40.00, 2, '🌽', 4.3, 46, 20, 16, 'Sweet corn that''s great boiled, grilled, or tossed into soups and salads for extra crunch.', TRUE),
    (35, 'Spinach', 30.00, 2, '🥬', 4.5, 78, 40, 15, 'Fresh green spinach leaves, nutrient-dense and versatile for cooking.', TRUE),
    (36, 'Cauliflower', 50.00, 2, '🥦', 4.1, 42, 22, 18, 'Fresh white cauliflower florets, great for curries, roasting, or stir-frying.', TRUE),
    (37, 'Cabbage', 40.00, 2, '🥬', 4.0, 35, 25, 20, 'Crunchy green cabbage, perfect for salads, slaws, and stir-fries.', TRUE),
    (38, 'Onion', 45.00, 2, '🧅', 4.2, 160, 100, 10, 'Essential red onions for every kitchen. Adds flavor and crunch to any dish.', TRUE),
    (39, 'Garlic', 20.00, 2, '🧄', 4.6, 95, 60, 12, 'Pungent and flavorful garlic cloves, a must-have for seasoning and health.', TRUE),
    (40, 'Bell Pepper', 80.00, 2, '🫑', 4.4, 67, 15, 15, 'Vibrant and crunchy bell peppers, perfect for stir-fries, salads, and stuffing.', TRUE),
    (41, 'Sweet Potato', 60.00, 2, '🍠', 4.3, 48, 30, 18, 'Nutritious sweet potatoes, great for roasting, mashing, or as a healthy snack.', TRUE),
    (42, 'Peas', 70.00, 2, '🫛', 4.5, 52, 20, 20, 'Fresh green peas, sweet and tender. Ideal for curries, pulao, and side dishes.', TRUE),
    (43, 'Beans', 50.00, 2, '🫛', 4.2, 41, 25, 16, 'Fresh green beans, crunchy and nutritious. Great for stir-frying and steaming.', TRUE),
    (44, 'Mushrooms', 90.00, 2, '🍄', 4.7, 84, 12, 0, 'Fresh button mushrooms, earthy and savory. Perfect for pasta, pizzas, and stir-fries.', TRUE);

-- DAIRY (14 products)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description, is_active) VALUES
    (13, 'Milk', 55.00, 3, '🥛', 4.5, 110, 24, 10, 'Fresh, creamy milk—perfect for tea, coffee, cereals, and everyday nutrition.', TRUE),
    (14, 'Cheese', 150.00, 3, '🧀', 4.7, 88, 14, 15, 'Rich and flavorful cheese that melts beautifully. Great for sandwiches, pasta, and snacks.', TRUE),
    (15, 'Butter', 180.00, 3, '🧈', 4.6, 73, 9, 8, 'Creamy butter for spreading, baking, and cooking. Adds a delicious richness to any dish.', TRUE),
    (16, 'Yogurt', 60.00, 3, '🥛', 4.4, 66, 18, 12, 'Smooth yogurt that''s great for breakfast, smoothies, and homemade raita.', TRUE),
    (45, 'Paneer', 120.00, 3, '🧀', 4.8, 142, 18, 12, 'Fresh and soft cottage cheese (paneer), a versatile protein for Indian dishes.', TRUE),
    (46, 'Ghee', 600.00, 3, '🧈', 4.9, 215, 15, 10, 'Pure cow ghee, aromatic and rich. Perfect for cooking and adding flavor to meals.', TRUE),
    (47, 'Ice Cream', 250.00, 3, '🍦', 4.7, 188, 10, 15, 'Creamy vanilla ice cream, the perfect dessert to satisfy your sweet cravings.', TRUE),
    (48, 'Buttermilk', 30.00, 3, '🥛', 4.2, 63, 40, 8, 'Refreshing and cooling buttermilk, great for digestion and summer heat.', TRUE),
    (49, 'Flavored Yogurt', 80.00, 3, '🥛', 4.5, 76, 25, 12, 'Delicious fruit-flavored yogurt, a healthy and tasty snack for any time.', TRUE),
    (50, 'Whipped Cream', 150.00, 3, '🥛', 4.3, 45, 12, 0, 'Light and fluffy whipped cream, perfect for topping desserts and fruits.', TRUE),
    (51, 'Sour Cream', 120.00, 3, '🥛', 4.1, 32, 15, 0, 'Thick and tangy sour cream, ideal for dips, baked potatoes, and tacos.', TRUE),
    (52, 'Condensed Milk', 180.00, 3, '🥛', 4.6, 87, 20, 10, 'Sweetened condensed milk, a key ingredient for many delicious desserts.', TRUE),
    (53, 'Soya Milk', 90.00, 3, '🥛', 4.0, 42, 18, 15, 'Nutritious plant-based soya milk, a great dairy alternative for health-conscious users.', TRUE),
    (54, 'Almond Milk', 250.00, 3, '🥛', 4.4, 59, 14, 0, 'Creamy almond milk, a delicious and healthy non-dairy milk alternative.', TRUE);

-- SNACKS (14 products)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description, is_active) VALUES
    (17, 'Cookies', 80.00, 4, '🍪', 4.8, 152, 32, 25, 'Crunchy cookies with a delightful sweetness—perfect with tea, coffee, or as a quick treat.', TRUE),
    (18, 'Chips', 50.00, 4, '🥔', 4.5, 97, 45, 20, 'Crispy, salty chips for movie nights and snack cravings. Enjoy the crunch!', TRUE),
    (19, 'Chocolate', 100.00, 4, '🍫', 4.9, 210, 27, 30, 'Smooth, indulgent chocolate to satisfy your sweet tooth. Great for gifting and desserts.', TRUE),
    (20, 'Popcorn', 70.00, 4, '🍿', 4.3, 54, 38, 35, 'Light and fluffy popcorn—perfect for binge-watching and quick snacking.', TRUE),
    (55, 'Almonds', 400.00, 4, '🥜', 4.8, 134, 30, 15, 'Premium roasted almonds, a crunchy and nutritious snack packed with vitamin E.', TRUE),
    (56, 'Cashews', 500.00, 4, '🥜', 4.9, 122, 25, 18, 'Creamy and delicious cashew nuts, perfect for snacking or adding to desserts.', TRUE),
    (57, 'Walnuts', 600.00, 4, '🥜', 4.7, 88, 20, 20, 'Healthy walnuts, rich in omega-3 fatty acids. Great for brain health and snacking.', TRUE),
    (58, 'Raisins', 150.00, 4, '🍇', 4.5, 67, 35, 22, 'Sweet and chewy raisins, a natural energy booster for your day.', TRUE),
    (59, 'Granola', 250.00, 4, '🥣', 4.4, 91, 15, 25, 'Crunchy granola with nuts and honey, perfect for a healthy breakfast or snack.', TRUE),
    (60, 'Trail Mix', 300.00, 4, '🥜', 4.6, 73, 20, 20, 'A mix of nuts, seeds, and dried fruits for sustained energy on the go.', TRUE),
    (61, 'Pretzels', 100.00, 4, '🥨', 4.2, 54, 40, 30, 'Classic salted pretzels, a crunchy and satisfying snack for any time.', TRUE),
    (62, 'Nachos', 90.00, 4, '🌮', 4.3, 86, 30, 25, 'Crispy corn nachos, perfect with cheese dip or salsa for movie nights.', TRUE),
    (63, 'Peanuts', 60.00, 4, '🥜', 4.1, 102, 50, 15, 'Roasted and salted peanuts, a classic and affordable high-protein snack.', TRUE),
    (64, 'Pistachios', 700.00, 4, '🥜', 4.8, 115, 18, 0, 'Delicious roasted pistachios, fun to crack and full of nutrients.', TRUE);

-- BEVERAGES (16 products)
INSERT INTO products (id, name, price, category_id, emoji, rating, reviews_count, stock, discount_percent, description, is_active) VALUES
    (21, 'Orange Juice', 90.00, 5, '🧃', 4.4, 61, 20, 15, 'Refreshing orange juice with a citrusy punch. Serve chilled for the best taste.', TRUE),
    (22, 'Coffee', 200.00, 5, '☕', 4.7, 139, 15, 20, 'Aromatic coffee to kickstart your day. Enjoy hot, iced, or with your favorite milk.', TRUE),
    (23, 'Tea', 120.00, 5, '🍵', 4.5, 103, 22, 18, 'Comforting tea for every mood. Brew strong or light—your perfect cup awaits.', TRUE),
    (24, 'Soda', 40.00, 5, '🥤', 3.8, 29, 0, 0, 'Classic fizzy soda—cool and refreshing. Best served chilled with ice.', FALSE),
    (65, 'Mango Juice', 80.00, 5, '🥭', 4.6, 94, 25, 18, 'Sweet and thick mango nectar, made from the finest ripe mangoes.', TRUE),
    (66, 'Apple Juice', 90.00, 5, '🍎', 4.5, 78, 22, 15, 'Clear and refreshing apple juice, naturally sweet and full of flavor.', TRUE),
    (67, 'Cranberry Juice', 150.00, 5, '🥤', 4.4, 52, 15, 0, 'Tart and refreshing cranberry juice, great on its own or as a mixer.', TRUE),
    (68, 'Green Tea', 180.00, 5, '🍵', 4.7, 145, 30, 20, 'Healthy green tea leaves, rich in antioxidants for a revitalizing break.', TRUE),
    (69, 'Energy Drink', 120.00, 5, '⚡', 4.1, 63, 40, 25, 'Instant energy boost to keep you going through your busy day.', TRUE),
    (70, 'Coconut Water', 60.00, 5, '🥥', 4.9, 112, 50, 12, 'Natural and refreshing coconut water, perfect for hydration and electrolytes.', TRUE),
    (71, 'Smoothie', 150.00, 5, '🥤', 4.8, 89, 12, 20, 'Delicious mixed fruit smoothie, a healthy and filling drink for any time.', TRUE),
    (72, 'Milkshake', 120.00, 5, '🥤', 4.7, 134, 15, 18, 'Thick and creamy chocolate milkshake, a classic treat for all ages.', TRUE),
    (73, 'Lemonade', 40.00, 5, '🍋', 4.3, 72, 45, 15, 'Zesty and refreshing lemonade, the perfect thirst quencher on a hot day.', TRUE),
    (74, 'Hot Chocolate', 100.00, 5, '☕', 4.6, 121, 20, 10, 'Rich and comforting hot chocolate, perfect for cozy evenings.', TRUE);

-- =====================================================
-- COUPONS (5 coupons matching legacy system)
-- =====================================================

INSERT INTO coupons (code, description, coupon_type, value, min_order_value, max_discount, applicable_categories, first_order_only, is_active, valid_from, valid_until) VALUES
    ('SAVE20', '20% off orders above ₹500', 'percentage', 20.00, 500.00, 100.00, '[]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year'),
    ('FRESH15', '15% off on fruits & vegetables', 'category', 15.00, 200.00, 75.00, '["Fruits", "Vegetables"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year'),
    ('WELCOME50', '₹50 off first order', 'fixed', 50.00, 300.00, 50.00, '[]'::JSONB, TRUE, TRUE, NOW(), NOW() + INTERVAL '1 year'),
    ('DAIRY10', '10% off on dairy products', 'category', 10.00, 150.00, 50.00, '["Dairy"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year'),
    ('SNACKS25', '₹25 off snacks orders', 'fixed', 25.00, 100.00, 25.00, '["Snacks"]'::JSONB, FALSE, TRUE, NOW(), NOW() + INTERVAL '1 year');

-- =====================================================
-- SEED DATA SUMMARY
-- =====================================================
-- Total Categories: 5
--   - Fruits (ID: 1)
--   - Vegetables (ID: 2)
--   - Dairy (ID: 3)
--   - Snacks (ID: 4)
--   - Beverages (ID: 5)
--
-- Total Products: 74
--   - Fruits: 16 products (ID: 1-6, 25-34)
--   - Vegetables: 14 products (ID: 7-12, 35-44)
--   - Dairy: 14 products (ID: 13-16, 45-54)
--   - Snacks: 14 products (ID: 17-20, 55-64)
--   - Beverages: 16 products (ID: 21-24, 65-74)
--
-- Total Coupons: 5
--   - SAVE20 (20% off orders above ₹500)
--   - FRESH15 (15% off on fruits & vegetables)
--   - WELCOME50 (₹50 off first order)
--   - DAIRY10 (10% off on dairy products)
--   - SNACKS25 (₹25 off snacks orders)
--
-- Note: This seed data exactly matches the legacy system (js/search.js)
-- All product IDs, prices, ratings, descriptions, and discounts are preserved
-- =====================================================
