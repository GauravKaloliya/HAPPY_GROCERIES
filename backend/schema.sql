-- Happy Groceries Database Schema
-- PostgreSQL 14+ compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

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
    address TEXT NOT NULL DEFAULT '',
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
CREATE INDEX users_email_idx ON users(email);


-- =====================================================
-- BRANDS
-- Dedicated table for product brands (e.g., Amul, Safal, Patanjali, Local Farm)
-- =====================================================
CREATE TABLE IF NOT EXISTS brands (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    description   TEXT         NOT NULL DEFAULT '',
    logo_url      VARCHAR(512),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    is_deleted    BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS brands_name_trgm_idx     ON brands USING GIN (name gin_trgm_ops) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS brands_active_idx        ON brands (is_active, is_deleted)
    WHERE is_active AND NOT is_deleted;
CREATE INDEX IF NOT EXISTS brands_name_active_idx   ON brands (name)
    WHERE is_active AND NOT is_deleted;


-- =====================================================
-- CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(80)  NOT NULL,
    description   TEXT         NOT NULL DEFAULT '',
    emoji         VARCHAR(10)  NOT NULL DEFAULT '',
    parent_id     INTEGER      REFERENCES categories(id) ON DELETE SET NULL,
    display_order INTEGER      NOT NULL DEFAULT 0,
    is_visible    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    is_deleted    BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at    TIMESTAMPTZ,

    CONSTRAINT categories_name_unique UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS categories_name_trgm_idx      ON categories USING GIN (name gin_trgm_ops) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS categories_parent_id_idx      ON categories (parent_id);
CREATE INDEX IF NOT EXISTS categories_display_order_idx  ON categories (display_order, name);
CREATE INDEX IF NOT EXISTS categories_visible_active_idx ON categories (is_visible, is_deleted)
    WHERE is_visible AND NOT is_deleted;


-- =====================================================
-- PRODUCTS (Master / template)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(150) NOT NULL,
    brand_id          INTEGER      REFERENCES brands(id) ON DELETE SET NULL,
    category_id       INTEGER      NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    price             DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    emoji             VARCHAR(10)  NOT NULL DEFAULT '',
    rating            DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
    reviews_count     INTEGER      NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
    stock             INTEGER      NOT NULL DEFAULT 0 CHECK (stock >= 0),
    discount_percent  INTEGER      NOT NULL DEFAULT 0 CHECK (discount_percent >= 0),
    description       TEXT         NOT NULL DEFAULT '',
    search_keywords   TEXT[],
    tags              TEXT[],
    attributes        JSONB        DEFAULT '{}',
    average_rating    DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (average_rating BETWEEN 0 AND 5),
    review_count      INTEGER      NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    is_featured       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_new_arrival    BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    image_url         VARCHAR(512),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    is_deleted        BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS products_category_active_idx    ON products (category_id, is_active)
    WHERE is_deleted = false AND is_active;
CREATE INDEX IF NOT EXISTS products_brand_active_idx       ON products (brand_id, is_active)
    WHERE brand_id IS NOT NULL AND is_deleted = false AND is_active;
CREATE INDEX IF NOT EXISTS products_popularity_idx         ON products ((average_rating * review_count) DESC NULLS LAST)
    WHERE is_active AND NOT is_deleted;
CREATE INDEX IF NOT EXISTS products_featured_new_idx       ON products (is_featured DESC, is_new_arrival DESC, created_at DESC)
    WHERE is_active AND NOT is_deleted;
CREATE INDEX IF NOT EXISTS products_gin_search_idx         ON products USING GIN (search_keywords, tags);
CREATE INDEX IF NOT EXISTS products_gin_attributes_idx     ON products USING GIN (attributes);


-- =====================================================
-- PRODUCT VARIANTS (sellable SKUs)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_variants (
    id                  BIGSERIAL PRIMARY KEY,
    product_id          INTEGER      NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku                 VARCHAR(80)  NOT NULL,
    variant_name        VARCHAR(120) NOT NULL,
    price               DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    stock_quantity      INTEGER      NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER      DEFAULT 10 CHECK (low_stock_threshold > 0),
    weight              INTEGER,
    unit_type           VARCHAR(30)  NOT NULL DEFAULT 'piece',
    unit_value          DECIMAL(10,3) DEFAULT 1.000,
    is_default          BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    is_deleted          BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT variants_sku_unique         UNIQUE (sku),
    CONSTRAINT variants_product_sku_unique UNIQUE (product_id, sku)
);

CREATE INDEX IF NOT EXISTS variants_product_id_idx      ON product_variants (product_id);
CREATE INDEX IF NOT EXISTS variants_sku_idx             ON product_variants (sku);
CREATE INDEX IF NOT EXISTS variants_in_stock_idx        ON product_variants (product_id, stock_quantity)
    WHERE stock_quantity > 0 AND NOT is_deleted;
CREATE INDEX IF NOT EXISTS variants_low_stock_alert_idx ON product_variants (stock_quantity)
    WHERE stock_quantity > 0 AND stock_quantity <= 20 AND NOT is_deleted;
CREATE INDEX IF NOT EXISTS variants_default_idx         ON product_variants (product_id)
    WHERE is_default AND NOT is_deleted;
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
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(cart_id, product_id, variant_id)
);

CREATE INDEX cart_items_cart_idx ON cart_items(cart_id);
CREATE INDEX cart_items_product_idx ON cart_items(product_id);
CREATE INDEX cart_items_variant_idx ON cart_items(variant_id);
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
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX order_items_order_idx ON order_items(order_id);
CREATE INDEX order_items_product_idx ON order_items(product_id);
CREATE INDEX order_items_order_is_deleted_idx ON order_items(order_id, is_deleted);
CREATE INDEX order_items_is_deleted_idx ON order_items(is_deleted);

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
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
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
-- DJANGO AUTH TABLES (for reference)
-- =====================================================

CREATE TABLE IF NOT EXISTS auth_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS django_content_type (
    id SERIAL PRIMARY KEY,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    UNIQUE(app_label, model)
);

CREATE TABLE IF NOT EXISTS auth_permission (
    id SERIAL PRIMARY KEY,
    content_type_id INTEGER NOT NULL REFERENCES django_content_type(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    codename VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE(content_type_id, codename)
);

CREATE TABLE IF NOT EXISTS auth_group_permissions (
    id BIGSERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE(group_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users_groups (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE(user_id, group_id)
);

CREATE TABLE IF NOT EXISTS users_user_permissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    UNIQUE(user_id, permission_id)
);

CREATE TABLE IF NOT EXISTS django_session (
    session_key VARCHAR(40) NOT NULL PRIMARY KEY,
    session_data TEXT NOT NULL,
    expire_date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX django_session_expire_date_idx ON django_session(expire_date);

CREATE TABLE IF NOT EXISTS django_admin_log (
    id BIGSERIAL PRIMARY KEY,
    action_time TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    content_type_id INTEGER REFERENCES django_content_type(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
    object_id TEXT,
    object_repr VARCHAR(200) NOT NULL,
    action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
    change_message TEXT NOT NULL
);

CREATE INDEX django_admin_log_content_type_idx ON django_admin_log(content_type_id);
CREATE INDEX django_admin_log_user_idx ON django_admin_log(user_id);

CREATE TABLE IF NOT EXISTS django_migrations (
    id BIGSERIAL PRIMARY KEY,
    app VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    applied TIMESTAMP WITH TIME ZONE NOT NULL
);

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
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to carts table
DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to coupons table
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- ACTIVITY LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
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

-- =====================================================
-- CONTACT MESSAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(254) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX contact_messages_user_idx ON contact_messages(user_id);
CREATE INDEX contact_messages_status_idx ON contact_messages(status);
CREATE INDEX contact_messages_created_idx ON contact_messages(created_at);

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
    comment VARCHAR(1000) NOT NULL,
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
CREATE INDEX product_reviews_product_approved_idx ON product_reviews(product_id, is_approved, is_deleted);
CREATE INDEX product_reviews_user_deleted_idx ON product_reviews(user_id, is_deleted);
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
-- SITE SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS site_settings (
    id BIGSERIAL PRIMARY KEY,
    tax_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0800,
    standard_delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 40.00,
    express_delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    free_delivery_threshold DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    site_name VARCHAR(100) NOT NULL DEFAULT 'Happy Groceries',
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
    "order" INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX sort_options_order_idx ON sort_options("order", label);

-- =====================================================
-- SIMPLE JWT TOKEN BLACKLIST
-- =====================================================

CREATE TABLE IF NOT EXISTS token_blacklist_blacklistedtoken (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    token VARCHAR(500) NOT NULL,
    UNIQUE(token)
);

CREATE INDEX token_blacklist_blacklistedtoken_token_idx ON token_blacklist_blacklistedtoken(token);

CREATE TABLE IF NOT EXISTS token_blacklist_outstandingtoken (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    token VARCHAR(500) NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    jti VARCHAR(255) NOT NULL UNIQUE,
    UNIQUE(token)
);

CREATE INDEX token_blacklist_outstandingtoken_jti_idx ON token_blacklist_outstandingtoken(jti);
CREATE INDEX token_blacklist_outstandingtoken_user_idx ON token_blacklist_outstandingtoken(user_id);

-- =====================================================
-- PRODUCT COMBOS / BUNDLES
-- Predefined combos (2–3 items) created by app/admin
-- =====================================================

CREATE TABLE IF NOT EXISTS product_combos (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    description         TEXT         NOT NULL DEFAULT '',
    image_url           VARCHAR(512),
    price               DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    is_featured         BOOLEAN      NOT NULL DEFAULT FALSE,
    stock_status        VARCHAR(20)  NOT NULL DEFAULT 'available'
        CHECK (stock_status IN ('available', 'low', 'out_of_stock')),
    display_order       INTEGER      NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    is_deleted          BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS combos_active_featured_idx ON product_combos (is_active, is_featured, display_order)
    WHERE is_deleted = false AND is_active;
CREATE INDEX IF NOT EXISTS combos_price_idx ON product_combos (price)
    WHERE is_deleted = false AND is_active;

DROP TRIGGER IF EXISTS update_product_combos_updated_at ON product_combos;
CREATE TRIGGER update_product_combos_updated_at
    BEFORE UPDATE ON product_combos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PRODUCT COMBO ITEMS
-- References specific variants
-- =====================================================

CREATE TABLE IF NOT EXISTS product_combo_items (
    id              BIGSERIAL PRIMARY KEY,
    combo_id        BIGINT       NOT NULL REFERENCES product_combos(id) ON DELETE CASCADE,
    product_id      INTEGER      NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id      BIGINT       NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity        INTEGER      NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    override_price  DECIMAL(12,2) CHECK (override_price IS NULL OR override_price >= 0),
    display_order   INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT combo_items_unique UNIQUE (combo_id, variant_id)
);

CREATE INDEX IF NOT EXISTS combo_items_combo_idx ON product_combo_items (combo_id);
CREATE INDEX IF NOT EXISTS combo_items_variant_idx ON product_combo_items (variant_id);
CREATE INDEX IF NOT EXISTS combo_items_product_idx ON product_combo_items (product_id);

-- Validate product/variant relation and max 3 items per combo.
CREATE OR REPLACE FUNCTION validate_product_combo_item()
RETURNS TRIGGER AS $$
DECLARE
    variant_product_id INTEGER;
    item_count INTEGER;
BEGIN
    SELECT product_id INTO variant_product_id
    FROM product_variants
    WHERE id = NEW.variant_id;

    IF variant_product_id IS NULL THEN
        RAISE EXCEPTION 'Variant % does not exist', NEW.variant_id;
    END IF;

    IF NEW.product_id <> variant_product_id THEN
        RAISE EXCEPTION 'variant_id % does not belong to product_id %', NEW.variant_id, NEW.product_id;
    END IF;

    SELECT COUNT(*) INTO item_count
    FROM product_combo_items
    WHERE combo_id = NEW.combo_id
      AND is_deleted = false
      AND (TG_OP = 'INSERT' OR id <> NEW.id);

    IF item_count >= 3 THEN
        RAISE EXCEPTION 'A combo cannot have more than 3 active items';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_product_combo_item ON product_combo_items;
CREATE TRIGGER trg_validate_product_combo_item
BEFORE INSERT OR UPDATE OF combo_id, product_id, variant_id, is_deleted ON product_combo_items
FOR EACH ROW
WHEN (NEW.is_deleted = false)
EXECUTE FUNCTION validate_product_combo_item();
