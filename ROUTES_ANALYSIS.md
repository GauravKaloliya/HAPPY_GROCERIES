# Routes Analysis & Missing Endpoints

## Frontend vs Backend API Comparison

### ✅ Matched Routes (Working Correctly)

#### Products
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/products/ | GET /api/products/ | ✅ |
| GET /api/products/${id}/ | GET /api/products/{id}/ | ✅ |
| GET /api/products/categories/ | GET /api/products/categories/ | ✅ |
| GET /api/products/?category= | GET /api/products/?category= | ✅ |
| GET /api/products/?search= | GET /api/products/?search= | ✅ |
| GET /api/products/${id}/related/ | GET /api/products/{id}/related/ | ✅ |
| GET /api/products/featured/ | GET /api/products/featured/ | ✅ |

#### Brands
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/brands/ | GET /api/products/brands/ | ✅ |

#### Cart
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/cart/ | GET /api/cart/ (list) | ✅ |
| POST /api/cart/add/ | POST /api/cart/add/ | ✅ |
| POST /api/cart/update_item/ | POST /api/cart/update_item/ | ✅ |
| POST /api/cart/remove_item/ | POST /api/cart/remove_item/ | ✅ |
| POST /api/cart/clear/ | POST /api/cart/clear/ | ✅ |

#### Coupons
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/coupons/ | GET /api/coupons/ (list) | ✅ |
| POST /api/coupons/validate/ | POST /api/coupons/validate/ | ✅ |
| POST /api/coupons/apply/ | POST /api/coupons/apply/ | ✅ |
| POST /api/coupons/remove/ | POST /api/coupons/remove/ | ✅ |
| POST /api/coupons/suggested/ | POST /api/coupons/suggested/ | ✅ |

#### Wishlist
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/wishlist/ | GET /api/wishlist/ (list) | ✅ |
| POST /api/wishlist/add/ | POST /api/wishlist/add/ | ✅ |
| POST /api/wishlist/remove/ | POST /api/wishlist/remove/ | ✅ |
| GET /api/wishlist/check/${productId}/ | GET /api/wishlist/check/{id}/ | ✅ |
| POST /api/wishlist/clear/ | POST /api/wishlist/clear/ | ✅ |

#### Reviews
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/reviews/product/${productId}/ | GET /api/reviews/product/{id}/ | ✅ |
| GET /api/reviews/product/${productId}/summary/ | GET /api/reviews/product/{id}/summary/ | ✅ |
| POST /api/reviews/product/${productId}/ | POST /api/reviews/product/{id}/ | ✅ |
| PATCH /api/reviews/${reviewId}/ | PATCH /api/reviews/{id}/ | ✅ |
| DELETE /api/reviews/${reviewId}/ | DELETE /api/reviews/{id}/ | ✅ |
| POST /api/reviews/${reviewId}/helpful/ | POST /api/reviews/{id}/helpful/ | ✅ |
| GET /api/reviews/my-reviews/ | GET /api/reviews/my-reviews/ | ✅ |
| GET /api/reviews/pending/ | GET /api/reviews/pending/ | ✅ |

#### Contact
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/contact/messages/ | GET /api/contact/messages/ (list) | ✅ |
| POST /api/contact/messages/submit/ | POST /api/contact/messages/submit/ | ✅ |

#### Activity Logs
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| POST /api/activity-logs/log_activity/ | POST /api/activity-logs/log_activity/ | ✅ |
| GET /api/activity-logs/ | GET /api/activity-logs/ (list) | ✅ |
| GET /api/activity-logs/statistics/ | GET /api/activity-logs/statistics/ | ✅ |

#### Auth
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| POST /api/auth/register/ | POST /api/auth/register/ | ✅ |
| POST /api/auth/login/ | POST /api/auth/login/ | ✅ |
| POST /api/auth/logout/ | POST /api/auth/logout/ | ✅ |
| POST /api/auth/refresh/ | POST /api/auth/refresh/ | ✅ |
| GET /api/auth/profile/ | GET /api/auth/profile/ | ✅ |
| PATCH /api/auth/profile/ | PATCH /api/auth/profile/ | ✅ |
| POST /api/auth/change-password/ | POST /api/auth/change-password/ | ✅ |
| POST /api/auth/check-username/ | POST /api/auth/check-username/ | ✅ |
| POST /api/auth/check-email/ | POST /api/auth/check-email/ | ✅ |
| POST /api/auth/check-password/ | POST /api/auth/check-password/ | ✅ |

#### Config
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/config/settings/ | GET /api/config/settings/ | ✅ |
| GET /api/config/sort-options/ | GET /api/config/sort-options/ | ✅ |
| GET /api/config/all/ | GET /api/config/all/ | ✅ |

---

### ⚠️ Missing Backend Routes

The following frontend API calls are made but don't have corresponding backend routes:

#### Orders
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/orders/${id}/ | GET /api/orders/{id}/ | ❌ MISSING |

#### Categories
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/products/categories/${id}/ | GET /api/products/categories/{id}/ | ❌ MISSING |

#### Brands
| Frontend API Call | Backend Route | Status |
|----------------|------------------|--------|
| GET /api/brands/${id}/ | GET /api/brands/{id}/ | ❌ MISSING |

---

### 🔧 Backend Views Check

All backend ViewSets have been checked. Here's the summary:

#### Products ViewSet (`products/views.py`)
- **Actions**: list, retrieve
- **Routes**: /api/products/, /api/products/{id}/, /api/products/categories/, /api/products/brands/, /api/products/combos/
- **Custom Actions**: categories, brands, related, featured
- ✅ All required actions are present

#### Cart ViewSet (`cart/views.py`)
- **Actions**: list (GET), add (POST), update_item (POST), remove_item (POST), clear (POST)
- **Routes**: /api/cart/, /api/cart/add/, /api/cart/update_item/, /api/cart/remove_item/, /api/cart/clear/
- ✅ All required actions are present

#### Orders ViewSet (`orders/views.py`)
- **Actions**: list, create (POST)
- **Routes**: /api/orders/, /api/orders/
- ⚠️ **Missing**: retrieve action for GET by ID

#### Coupons ViewSet (`coupons/views.py`)
- **Actions**: list, validate, apply, remove, suggested (POST)
- **Routes**: /api/coupons/, /api/coupons/validate/, /api/coupons/apply/, /api/coupons/remove/, /api/coupons/suggested/
- ✅ All required actions are present

#### Wishlist ViewSet (`wishlist/views.py`)
- **Actions**: list, add, remove, check_item (GET), clear (POST)
- **Routes**: /api/wishlist/, /api/wishlist/add/, /api/wishlist/remove/, /api/wishlist/check/{id}/, /api/wishlist/clear/
- ✅ All required actions are present

#### Reviews ViewSet (`reviews/views.py`)
- **Actions**: list, create, update, destroy, helpful (POST), product_review_summary (GET), my_reviews (GET), pending_reviews (GET)
- **Routes**: /api/reviews/product/{id}/, /api/reviews/{id}/summary/, /api/reviews/my-reviews/, /api/reviews/pending/
- ✅ All required actions are present

#### Contact ViewSet (`contact/views.py`)
- **Actions**: list, submit (POST)
- **Routes**: /api/contact/messages/, /api/contact/messages/submit/
- ✅ All required actions are present

#### ActivityLog ViewSet (`activity_logs/views.py`)
- **Actions**: list, create, statistics (GET), log_activity (POST)
- **Routes**: /api/activity-logs/, /api/activity-logs/statistics/, /api/activity-logs/log_activity/
- ✅ All required actions are present

---

### 📋 Required Actions

1. **Add Missing Route in Orders ViewSet**:
   ```python
   def retrieve(self, request, *args, **kwargs):
       order = self.get_object()
       serializer = self.get_serializer(order)
       return Response(serializer.data)
   ```

2. **Optional: Add Individual Category Endpoint** (if needed for category details page):
   ```python
   # In products/views.py ProductViewSet
   def categories_detail(self, request):
       category_id = self.kwargs.get('id')
       category = Category.objects.get(id=category_id, is_deleted=False)
       serializer = CategorySerializer(category)
       return Response(serializer.data)
   ```

3. **Optional: Add Individual Brand Endpoint** (if needed for brand details page):
   ```python
   # In products/views.py BrandViewSet
   def retrieve(self, request, *args, **kwargs):
       brand = self.get_object()
       serializer = self.get_serializer(brand)
       return Response(serializer.data)
   ```

---

### ✅ Backend Routes Not Used

All backend routes are being used by the frontend. There are no unused or orphaned routes detected.

---

## Summary

- ✅ **Total Frontend API Files**: 13
- ✅ **Total Backend URL Files**: 12
- ✅ **Matched Routes**: 52
- ⚠️ **Missing Routes**: 3
  - GET /api/orders/{id}/ (order details)
  - GET /api/products/categories/{id}/ (category details)
  - GET /api/products/brands/{id}/ (brand details)

---

## Recommendations

### Priority 1 (Required for Functionality)
1. **Add retrieve action to Orders ViewSet** - Frontend users need to view order details

### Priority 2 (Nice to Have)
2. **Add retrieve action to Products ViewSet categories** - For category details page
3. **Add retrieve action to Products ViewSet brands** - For brand details page

### Priority 3 (Low Priority)
4. Consider adding search functionality to Orders ViewSet - To find past orders
5. Consider adding analytics endpoints for better user insights
