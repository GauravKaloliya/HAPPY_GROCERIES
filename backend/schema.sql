-- Happy Groceries Database Schema
-- PostgreSQL 14+ compatible
-- This schema matches the Django models and migrations

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
    first_order BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);


CREATE INDEX users_phone_idx ON users(phone);
CREATE INDEX users_username_idx ON users(username);
CREATE INDEX users_is_deleted_idx ON users(is_deleted);

-- =====================================================
-- CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    emoji VARCHAR(10) NOT NULL DEFAULT '',
    color VARCHAR(50) NOT NULL DEFAULT 'var(--primary-pink)',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX categories_name_idx ON categories(name);
CREATE INDEX categories_is_deleted_idx ON categories(is_deleted);

-- =====================================================
-- BRANDS
-- =====================================================

CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) UNIQUE,
    description TEXT,
    logo VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX brands_name_idx ON brands(name);
CREATE INDEX brands_is_active_idx ON brands(is_active);
CREATE INDEX brands_is_deleted_idx ON brands(is_deleted);

-- =====================================================
-- PRODUCTS
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    -- Pricing
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    mrp DECIMAL(10, 2) NOT NULL CHECK (mrp >= price),
    -- Unit & Packaging
    unit VARCHAR(20) NOT NULL DEFAULT 'piece'
        CHECK (unit IN ('kg', 'g', 'mg', 'ltr', 'ml', 'piece', 'pack', 'dozen', 'bunch', 'bottle', 'can', 'box', 'jar', 'other')),
    pack_size DECIMAL(8, 2) CHECK (pack_size > 0),
    -- Category & Brand
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
    brand_name VARCHAR(100),
    -- Tax & Compliance (India-specific)
    hsn_code VARCHAR(8),
    gst_rate DECIMAL(4, 2) NOT NULL DEFAULT 5.00
        CHECK (gst_rate IN (0.00, 0.25, 5.00, 12.00, 18.00, 28.00)),
    -- Flags / Badges
    is_veg BOOLEAN NOT NULL DEFAULT TRUE,
    is_organic BOOLEAN NOT NULL DEFAULT FALSE,
    is_fresh BOOLEAN NOT NULL DEFAULT FALSE,
    -- Display & Quality
    emoji VARCHAR(10) NOT NULL DEFAULT '',
    rating DECIMAL(2, 1) NOT NULL DEFAULT 4.0 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    description TEXT NOT NULL DEFAULT '',
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX products_name_idx ON products(name);
CREATE INDEX products_category_is_active_idx ON products(category_id, is_active);
CREATE INDEX products_brand_id_idx ON products(brand_id);
CREATE INDEX products_unit_idx ON products(unit);
CREATE INDEX products_mrp_idx ON products(mrp);
CREATE INDEX products_gst_rate_idx ON products(gst_rate);
CREATE INDEX products_is_veg_idx ON products(is_veg);
CREATE INDEX products_is_organic_idx ON products(is_organic);
CREATE INDEX products_is_fresh_idx ON products(is_fresh);
CREATE INDEX products_is_deleted_idx ON products(is_deleted);

-- =====================================================
-- COMBOS
-- =====================================================

CREATE TABLE IF NOT EXISTS combos (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    discount_percent INTEGER NOT NULL DEFAULT 10 CHECK (discount_percent >= 0 AND discount_percent <= 50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX combos_is_active_idx ON combos(is_active);
CREATE INDEX combos_is_deleted_idx ON combos(is_deleted);

-- Many-to-many relationship for combos and products
CREATE TABLE IF NOT EXISTS combos_products (
    id BIGSERIAL PRIMARY KEY,
    combo_id INTEGER NOT NULL REFERENCES combos(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE(combo_id, product_id)
);

CREATE INDEX combos_products_combo_idx ON combos_products(combo_id);
CREATE INDEX combos_products_product_idx ON combos_products(product_id);

-- =====================================================
-- CARTS
-- =====================================================

CREATE TABLE IF NOT EXISTS carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX carts_user_idx ON carts(user_id);
CREATE INDEX carts_user_is_deleted_idx ON carts(user_id, is_deleted);

-- =====================================================
-- CART ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(cart_id, product_id)
);

CREATE INDEX cart_items_cart_idx ON cart_items(cart_id);
CREATE INDEX cart_items_product_idx ON cart_items(product_id);
CREATE INDEX cart_items_cart_is_deleted_idx ON cart_items(cart_id, is_deleted);

-- =====================================================
-- ORDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    order_id VARCHAR(20) NOT NULL UNIQUE CHECK (order_id ~ '^HG[0-9]{8}$'),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    delivery_type VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (delivery_type IN ('standard', 'express')),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax DECIMAL(10, 2) NOT NULL CHECK (tax >= 0),
    applied_discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (applied_discount_amount >= 0),
    delivery_charge DECIMAL(10, 2) NOT NULL CHECK (delivery_charge >= 0),
    coupon_discount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (coupon_discount >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    delivery_name VARCHAR(100) NOT NULL,
    delivery_phone VARCHAR(15) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_instructions TEXT NOT NULL DEFAULT '',
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX orders_order_id_idx ON orders(order_id);
CREATE INDEX orders_user_idx ON orders(user_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_user_status_idx ON orders(user_id, status);
CREATE INDEX orders_is_deleted_idx ON orders(is_deleted);
CREATE INDEX orders_user_created_idx ON orders(user_id, created_at DESC);
CREATE INDEX orders_applied_discount_idx ON orders(applied_discount_amount);

-- =====================================================
-- ORDER ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
    product_name VARCHAR(100) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL CHECK (product_price >= 0),
    product_emoji VARCHAR(10) NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent >= 0),
    applied_discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (applied_discount_amount >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX order_items_order_idx ON order_items(order_id);
CREATE INDEX order_items_product_idx ON order_items(product_id);
CREATE INDEX order_items_order_is_deleted_idx ON order_items(order_id, is_deleted);
CREATE INDEX order_items_is_deleted_idx ON order_items(is_deleted);
CREATE INDEX order_items_applied_discount_idx ON order_items(applied_discount_amount);

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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX coupons_code_idx ON coupons(code);
CREATE INDEX coupons_is_active_idx ON coupons(is_active);
CREATE INDEX coupons_active_valid_idx ON coupons(is_active, valid_until);
CREATE INDEX coupons_categories_gin ON coupons USING GIN (applicable_categories);
CREATE INDEX coupons_code_is_active_idx ON coupons(code, is_active);
CREATE INDEX coupons_is_deleted_idx ON coupons(is_deleted);

-- =====================================================
-- COUPON USAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS coupon_usages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    discount_amount DECIMAL(10, 2) NOT NULL CHECK (discount_amount >= 0),
    used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, coupon_id)
);

CREATE INDEX coupon_usages_user_idx ON coupon_usages(user_id);
CREATE INDEX coupon_usages_coupon_idx ON coupon_usages(coupon_id);
CREATE INDEX coupon_usages_order_idx ON coupon_usages(order_id);
CREATE INDEX coupon_usages_user_is_deleted_idx ON coupon_usages(user_id, is_deleted);
CREATE INDEX coupon_usages_coupon_is_deleted_idx ON coupon_usages(coupon_id, is_deleted);
CREATE INDEX coupon_usages_is_deleted_idx ON coupon_usages(is_deleted);

-- =====================================================
-- WISHLIST ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, product_id)
);

CREATE INDEX wishlist_items_user_idx ON wishlist_items(user_id);
CREATE INDEX wishlist_items_product_idx ON wishlist_items(product_id);
CREATE INDEX wishlist_items_user_is_deleted_idx ON wishlist_items(user_id, is_deleted);
CREATE INDEX wishlist_items_product_is_deleted_idx ON wishlist_items(product_id, is_deleted);

-- =====================================================
-- PRODUCT REVIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(100) NOT NULL DEFAULT '',
    comment TEXT NOT NULL CHECK (LENGTH(comment) <= 1000),
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, product_id, order_id)
);

CREATE INDEX product_reviews_user_idx ON product_reviews(user_id);
CREATE INDEX product_reviews_product_idx ON product_reviews(product_id);
CREATE INDEX product_reviews_order_idx ON product_reviews(order_id);
CREATE INDEX product_reviews_product_approved_deleted_idx ON product_reviews(product_id, is_approved, is_deleted);
CREATE INDEX product_reviews_user_is_deleted_idx ON product_reviews(user_id, is_deleted);
CREATE INDEX product_reviews_rating_idx ON product_reviews(rating);

-- =====================================================
-- REVIEW HELPFUL VOTES
-- =====================================================

CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

CREATE INDEX review_helpful_votes_review_idx ON review_helpful_votes(review_id);
CREATE INDEX review_helpful_votes_user_idx ON review_helpful_votes(user_id);

-- =====================================================
-- ACTIVITY LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'search',
        'filter_apply', 'add_to_wishlist', 'remove_from_wishlist', 'coupon_apply',
        'checkout', 'login', 'logout', 'signup', 'contact_form', 'profile_update',
        'settings_change'
    )),
    page VARCHAR(255) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX activity_logs_user_created_idx ON activity_logs(user_id, created_at);
CREATE INDEX activity_logs_action_created_idx ON activity_logs(action, created_at);
CREATE INDEX activity_logs_page_idx ON activity_logs(page);
CREATE INDEX activity_logs_session_id_idx ON activity_logs(session_id);
CREATE INDEX activity_logs_user_idx ON activity_logs(user_id);

-- =====================================================
-- CONTACT MESSAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(254) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX contact_messages_user_idx ON contact_messages(user_id);
CREATE INDEX contact_messages_status_idx ON contact_messages(status);
CREATE INDEX contact_messages_created_idx ON contact_messages(created_at);

-- =====================================================
-- SITE SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    tax_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0800 CHECK (tax_rate >= 0),
    standard_delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 40.00 CHECK (standard_delivery_charge >= 0),
    express_delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 50.00 CHECK (express_delivery_charge >= 0),
    free_delivery_threshold DECIMAL(10, 2) NOT NULL DEFAULT 500.00 CHECK (free_delivery_threshold >= 0),
    site_name VARCHAR(100) NOT NULL DEFAULT 'HappyGroceries',
    site_currency VARCHAR(10) NOT NULL DEFAULT '₹',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SORT OPTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS sort_options (
    id SERIAL PRIMARY KEY,
    value VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0 CHECK ("order" >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX sort_options_order_idx ON sort_options("order");

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

-- Triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_combos_updated_at ON combos;
CREATE TRIGGER update_combos_updated_at BEFORE UPDATE ON combos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
