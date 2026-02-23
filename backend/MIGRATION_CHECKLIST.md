# Schema Migration Checklist

## ✅ Completed Tasks

### 1. Database Schema Files
- [x] Created `schema.sql` with complete new schema
- [x] Updated `seed_data.sql` with new seed data including brands and updated products
- [x] All indexes match the schema specification

### 2. Model Updates

#### Products App
- [x] Created `Brand` model with all fields and indexes
- [x] Updated `Product` model with:
  - [x] `mrp` field
  - [x] `unit` field with choices
  - [x] `pack_size` field
  - [x] `brand_id` foreign key
  - [x] `brand_name` denormalized field
  - [x] `hsn_code` field
  - [x] `gst_rate` field with choices
  - [x] `is_veg` boolean field
  - [x] `is_organic` boolean field
  - [x] `is_fresh` boolean field
  - [x] Updated all indexes
- [x] Created `ComboProduct` through model
- [x] Updated `Combo` model to use through relationship

#### Orders App
- [x] Added `applied_discount_amount` to `Order` model
- [x] Added `applied_discount_amount` to `OrderItem` model
- [x] Updated indexes

#### Coupons App
- [x] Changed `applicable_categories` to JSONField from django.contrib.postgres
- [x] Updated indexes

#### Reviews App
- [x] Verified `order_id` field exists in `ProductReview`
- [x] Verified indexes

#### Cart App
- [x] Updated indexes

#### Wishlist App
- [x] Updated indexes

#### Activity Logs App
- [x] Changed `details` default to dict
- [x] Updated indexes

#### Contact App
- [x] Added indexes

#### Site Config App
- [x] Verified all fields and indexes

#### Users App
- [x] No changes required

### 3. Serializer Updates
- [x] Updated `products/serializers.py`:
  - [x] Created `BrandSerializer`
  - [x] Updated `ProductSerializer` with all new fields
  - [x] Updated `ProductListSerializer`
  - [x] Updated `ComboProductSerializer`
- [x] Updated `orders/serializers.py` with `applied_discount_amount`

### 4. View Updates
- [x] Updated `products/views.py`:
  - [x] Created `BrandViewSet`
  - [x] Updated `ProductViewSet` with brand filtering and new field filters
  - [x] Added filters for unit, gst_rate, is_veg, is_organic, is_fresh
  - [x] Updated `ComboViewSet`
- [x] Updated `orders/services/order_service.py`:
  - [x] Added `applied_discount_amount` calculation in order creation
  - [x] Added `applied_discount_amount` to order items

### 5. URL Configuration
- [x] Updated `products/urls.py` to include brands endpoint

### 6. Admin Configuration
- [x] Updated `products/admin.py`:
  - [x] Registered `Brand` model
  - [x] Updated `ProductAdmin` with new fields
  - [x] Updated `ComboAdmin` with inline
- [x] Updated `orders/admin.py` with new fields
- [x] Updated `cart/admin.py`
- [x] Updated `users/admin.py`
- [x] Updated `coupons/admin.py`
- [x] Other admin files already correct

### 7. Settings Configuration
- [x] Added `'django.contrib.postgres'` to `INSTALLED_APPS`

### 8. Documentation
- [x] Created `SCHEMA_CHANGES.md` with comprehensive change summary
- [x] Created `MIGRATION_CHECKLIST.md` (this file)

## 📋 Next Steps (Manual Actions Required)

### Before Running Migrations
1. Backup existing database
2. Review all model changes with team
3. Create a migration plan for production

### Migration Process
1. Run `python manage.py makemigrations` to create migration files
2. Review generated migrations
3. Run `python manage.py migrate` to apply changes
4. Verify database schema matches `schema.sql`

### Data Migration (if needed)
1. Populate brand associations for existing products
2. Set appropriate default values for:
   - `mrp` (can set equal to current `price`)
   - `unit` (default to 'piece')
   - `pack_size` (set to 1.0 or appropriate value)
   - `gst_rate` (set based on product category)
   - `is_veg` (default to True for most products)
   - `is_organic` (default to False)
   - `is_fresh` (set True for fruits/vegetables)
3. Calculate and set `applied_discount_amount` for existing orders

### Testing Checklist
- [ ] Test all CRUD operations
- [ ] Test filtering and searching
- [ ] Test coupon application with JSONField
- [ ] Test order creation with new discount fields
- [ ] Test admin interfaces
- [ ] Test API endpoints
- [ ] Performance test indexes

### Frontend Updates Required
- Update product display to show:
  - MRP and discount amount
  - Unit and pack size
  - Brand information
  - GST rate (if needed)
  - Veg/Non-veg indicator
- Add brand filtering
- Add unit filtering
- Update order display to show applied_discount_amount

### Deployment Considerations
1. Deploy schema changes during maintenance window
2. Monitor database performance after migration
3. Have rollback plan ready
4. Test on staging environment first

## 📊 Schema Statistics

### New Tables: 2
- brands
- combos_products

### Modified Tables: 10
- products (7 new fields, 6 new indexes)
- orders (1 new field, 1 new index)
- order_items (1 new field, 1 new index)
- coupons (1 field type change)
- categories (updated indexes)
- carts (updated indexes)
- cart_items (updated indexes)
- wishlist_items (updated indexes)
- activity_logs (updated indexes, field default change)
- contact_messages (updated indexes)

### Total Indexes Added: 20+
### Total New Fields: 10+
### Changed Field Types: 1
