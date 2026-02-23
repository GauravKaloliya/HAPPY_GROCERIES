# Schema Migration Summary

## Overview
This document summarizes the changes made to update the backend models to match the new database schema.

## Database Schema Changes

### New Tables
1. **brands** - Brand model for product categorization
2. **combos_products** - Many-to-many relationship table for combos

### Modified Tables

#### users
- No structural changes required

#### categories
- No structural changes required
- Updated indexes to match schema

#### products (Major Changes)
Added fields:
- `mrp` - Maximum Retail Price (required in India)
- `unit` - Unit of measurement with specific ENUM values
- `pack_size` - Pack size (e.g., 0.5 for 500g)
- `brand_id` - Foreign key to brands
- `brand_name` - Denormalized brand name for faster reads
- `hsn_code` - HSN code for tax compliance
- `gst_rate` - GST rate with specific allowed values (0, 0.25, 5, 12, 18, 28)
- `is_veg` - Vegetarian flag
- `is_organic` - Organic flag
- `is_fresh` - Fresh produce flag

Added indexes:
- `products_unit_idx`
- `products_mrp_idx`
- `products_gst_rate_idx`
- `products_is_veg_idx`
- `products_is_organic_idx`
- `products_is_fresh_idx`
- `products_brand_id_idx`

#### combos
- No structural changes required
- Updated to use through model (ComboProduct)

#### carts
- No structural changes required
- Updated indexes

#### cart_items
- No structural changes required
- Updated indexes

#### orders
Added fields:
- `applied_discount_amount` - Applied discount amount

Added indexes:
- `orders_applied_discount_idx`

#### order_items
Added fields:
- `applied_discount_amount` - Applied discount amount

Added indexes:
- `order_items_applied_discount_idx`

#### coupons
Changed fields:
- `applicable_categories` - Now using JSONField type

#### product_reviews
- No structural changes required
- Already had order_id field

#### review_helpful_votes
- No structural changes required

#### wishlist_items
- No structural changes required
- Updated indexes

#### activity_logs
- Changed `details` default to dict instead of empty JSONField
- Updated indexes

#### contact_messages
- Added indexes to match schema

#### site_settings
- No structural changes required

#### sort_options
- No structural changes required

## Django Model Updates

### Products App
- Created new `Brand` model
- Updated `Product` model with all new fields
- Created `ComboProduct` through model for combos
- Updated `Combo` model to use through relationship
- Updated all serializers with new fields
- Added `BrandViewSet` to views
- Added brands to URL router
- Updated admin configuration

### Orders App
- Added `applied_discount_amount` to `Order` and `OrderItem` models
- Updated serializers
- Updated admin configuration

### Coupons App
- Changed `applicable_categories` to use `JSONField` from django.contrib.postgres
- Updated admin configuration

### Other Apps
- Updated admin configurations for:
  - users
  - cart
  - wishlist
  - reviews
  - contact
  - activity_logs
  - site_config
- Updated indexes in all models to match schema

## Settings Changes
- Added `'django.contrib.postgres'` to `DJANGO_APPS` to enable JSONField support

## Seed Data Updates
- Added brand data (11 brands)
- Updated all 74 products with:
  - Correct MRP prices
  - Proper unit and pack_size values
  - Brand associations
  - Correct GST rates based on Indian tax laws
  - All products with rating = 0.0 and reviews_count = 0
- Updated site settings (tax_rate = 0.00)
- Added additional coupons (total 10 coupons)

## Key Business Logic Changes

### Product Pricing
- `price` field now represents the selling/discounted price
- `mrp` field stores the Maximum Retail Price
- `discount_amount` calculated as `mrp - price`

### Product Units
- Products now have explicit unit types (kg, g, mg, ltr, ml, piece, pack, dozen, etc.)
- `pack_size` stores the numerical value (e.g., 0.5 for 500g, 6 for pack of 6)

### GST Compliance
- Products have specific GST rates (0%, 0.25%, 5%, 12%, 18%, 28%)
- HSN codes can be stored for tax compliance

### Product Badges
- `is_veg` - Vegetarian products
- `is_organic` - Organic products
- `is_fresh` - Fresh produce (fruits, vegetables)

### Brand Management
- Products can be associated with brands
- Brand names are denormalized for faster queries

## API Changes

### New Endpoints
- `GET /api/brands` - List all brands
- `GET /api/products?brand=<name>` - Filter by brand
- `GET /api/products?unit=<unit>` - Filter by unit
- `GET /api/products?gst_rate=<rate>` - Filter by GST rate
- `GET /api/products?is_veg=<true/false>` - Filter vegetarian/non-vegetarian
- `GET /api/products?is_organic=<true>` - Filter organic products
- `GET /api/products?is_fresh=<true>` - Filter fresh produce

### Updated Serializers
- All product serializers now include new fields (mrp, unit, pack_size, brand, etc.)
- Order serializers now include applied_discount_amount

## Migration Notes

When running migrations:
1. Create new migrations for all model changes
2. Run `python manage.py makemigrations`
3. Run `python manage.py migrate`

For existing data:
1. Set default values for new required fields (mrp, unit, etc.)
2. Populate brand associations where possible
3. Update GST rates based on product categories
4. Set appropriate values for boolean flags (is_veg, is_organic, is_fresh)
