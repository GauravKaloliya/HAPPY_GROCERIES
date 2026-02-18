# Seed Data Migration - Legacy System to Backend

## Overview

This document describes the migration of seed data from the legacy system (JavaScript-based) to the new Django backend with SQL-based migrations.

## Changes Made

### 1. Created `seed_data.sql` File
- **Location**: `/backend/seed_data.sql`
- **Purpose**: Standalone SQL file with all seed data matching the legacy system
- **Content**:
  - 5 Categories (Fruits, Vegetables, Dairy, Snacks, Beverages)
  - 74 Products with exact legacy data
  - 5 Coupons (SAVE20, FRESH15, WELCOME50, DAIRY10, SNACKS25)

### 2. Removed `seed_data.py` File
- **File Removed**: `/backend/seed_data.py`
- **Reason**: Migrated to SQL-based approach for better database integration
- **Old Approach**: Python Django management command

### 3. Created Django Migration `0003_seed_initial_data.py`
- **Location**: `/backend/products/migrations/0003_seed_initial_data.py`
- **Purpose**: Automated seed data migration as part of Django's migration system
- **Features**:
  - Seeds categories with exact legacy data
  - Seeds all 74 products with matching IDs, prices, descriptions, etc.
  - Seeds 5 coupons with proper configurations
  - Uses `get_or_create()` to prevent duplicates
  - Properly handles Decimal fields for prices and ratings

### 4. Updated `schema.sql` File
- **Location**: `/backend/schema.sql`
- **Changes**: Integrated all seed data directly into the schema file
- **Content Added**:
  - Full product catalog (74 products)
  - All categories with descriptions
  - All coupons with configurations
  - Comprehensive comments and documentation

## Data Verification

### Product Categories (5 total)

| Category ID | Name       | Emoji | Product Count |
|-------------|------------|-------|---------------|
| 1           | Fruits     | 🍎    | 16            |
| 2           | Vegetables | 🥕    | 14            |
| 3           | Dairy      | 🥛    | 14            |
| 4           | Snacks     | 🍪    | 14            |
| 5           | Beverages  | 🧃    | 16            |

### Products Breakdown

#### Fruits (16 products) - IDs: 1-6, 25-34
1. Apple, 2. Banana, 3. Orange, 4. Grapes, 5. Strawberry, 6. Watermelon
25. Mango, 26. Pineapple, 27. Kiwi, 28. Papaya, 29. Guava
30. Pomegranate, 31. Blueberry, 32. Peach, 33. Cherry, 34. Avocado

#### Vegetables (14 products) - IDs: 7-12, 35-44
7. Carrot, 8. Tomato, 9. Broccoli, 10. Cucumber, 11. Potato, 12. Corn
35. Spinach, 36. Cauliflower, 37. Cabbage, 38. Onion, 39. Garlic
40. Bell Pepper, 41. Sweet Potato, 42. Peas, 43. Beans, 44. Mushrooms

#### Dairy (14 products) - IDs: 13-16, 45-54
13. Milk, 14. Cheese, 15. Butter, 16. Yogurt
45. Paneer, 46. Ghee, 47. Ice Cream, 48. Buttermilk
49. Flavored Yogurt, 50. Whipped Cream, 51. Sour Cream
52. Condensed Milk, 53. Soya Milk, 54. Almond Milk

#### Snacks (14 products) - IDs: 17-20, 55-64
17. Cookies, 18. Chips, 19. Chocolate, 20. Popcorn
55. Almonds, 56. Cashews, 57. Walnuts, 58. Raisins
59. Granola, 60. Trail Mix, 61. Pretzels, 62. Nachos
63. Peanuts, 64. Pistachios

#### Beverages (16 products) - IDs: 21-24, 65-74
21. Orange Juice, 22. Coffee, 23. Tea, 24. Soda (Out of Stock)
65. Mango Juice, 66. Apple Juice, 67. Cranberry Juice, 68. Green Tea
69. Energy Drink, 70. Coconut Water, 71. Smoothie, 72. Milkshake
73. Lemonade, 74. Hot Chocolate

### Coupons (5 total)

| Code     | Type      | Value | Description                              | Min Order |
|----------|-----------|-------|------------------------------------------|-----------|
| SAVE20   | Percentage| 20%   | 20% off orders above ₹500                 | ₹500      |
| FRESH15  | Category  | 15%   | 15% off on fruits & vegetables            | ₹200      |
| WELCOME50| Fixed     | ₹50   | ₹50 off first order                      | ₹300      |
| DAIRY10  | Category  | 10%   | 10% off on dairy products                 | ₹150      |
| SNACKS25 | Fixed     | ₹25   | ₹25 off snacks orders                    | ₹100      |

## Legacy System Compatibility

All data exactly matches the legacy system (`js/search.js`):

✅ **Product IDs**: Preserved exactly (1-74)
✅ **Prices**: Match original values in ₹
✅ **Ratings**: Exact decimal values (3.8 - 4.9)
✅ **Reviews Count**: Exact counts from legacy
✅ **Stock Levels**: Exact inventory numbers
✅ **Discount Percentages**: Exact discount values
✅ **Descriptions**: Full descriptions preserved
✅ **Emojis**: All product/category emojis preserved
✅ **Active Status**: Soda marked inactive (stock=0)

## How to Use

### Option 1: Using Django Migrations (Recommended)

```bash
# From the backend directory
cd backend

# Run migrations (includes seed data migration)
python manage.py migrate

# All seed data will be automatically inserted
```

### Option 2: Using SQL Files Directly

```bash
# From the backend directory
cd backend

# Apply schema first (includes seed data)
psql -U your_user -d your_database -f schema.sql

# Or apply seed data separately (after schema)
psql -U your_user -d your_database -f seed_data.sql
```

### Option 3: Fresh Database Setup

```bash
# Create new database
createdb happygroceries

# Apply schema with seed data
psql -U your_user -d happygroceries -f schema.sql

# Run Django migrations
cd backend
python manage.py migrate

# The seed data migration (0003) will skip duplicates
```

## Important Notes

1. **Migration Safety**: The migration uses `get_or_create()` to prevent duplicate entries
2. **ID Preservation**: Product IDs match the legacy system exactly
3. **Stock Management**: Products with 0 stock are automatically marked as inactive
4. **Decimal Precision**: All prices use DECIMAL(10,2) for exact monetary values
5. **Ratings**: Ratings use DECIMAL(2,1) for proper decimal precision
6. **JSONB Fields**: Coupons use JSONB for applicable_categories
7. **Timestamps**: All records include created_at/updated_at timestamps

## Verification Commands

```sql
-- Verify total counts
SELECT
    (SELECT COUNT(*) FROM categories) as categories,
    (SELECT COUNT(*) FROM products) as products,
    (SELECT COUNT(*) FROM coupons) as coupons;

-- Verify category distribution
SELECT c.name, COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY c.id;

-- Check for inactive products
SELECT name, stock, is_active
FROM products
WHERE is_active = FALSE;

-- Verify coupons
SELECT code, coupon_type, value, is_active
FROM coupons
ORDER BY code;
```

## Future Updates

To add or modify seed data:

1. **For small changes**: Use Django admin or Django shell
2. **For bulk changes**: Update migration `0003_seed_initial_data.py`
3. **For complete reset**: Modify `schema.sql` seed data section

Always keep both the migration and SQL files in sync for consistency.

## Rollback Plan

If you need to revert seed data changes:

```bash
# Rollback the migration
python manage.py migrate products 0002

# Or manually truncate tables
TRUNCATE products, categories, coupons CASCADE;

# Re-run migration
python manage.py migrate products 0003
```

## Support

For issues or questions about seed data migration:
- Check Django migration logs: `python manage.py showmigrations products`
- Verify database state: Use the verification commands above
- Check legacy data: Review `/js/search.js` for source of truth

---

**Migration Date**: February 18, 2026
**Legacy System Reference**: `/js/search.js`
**Backend Framework**: Django 6.0.2
**Database**: PostgreSQL (with SQLite support for development)
