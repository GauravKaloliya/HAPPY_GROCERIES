# Styles Summary - Frontend Updates

## New CSS Classes Required

The following new CSS classes have been added to the frontend for the new schema features. Make sure these styles are present in your `index.css` or `mobile.css` files.

---

## Product Badges

### Badge Container
```css
.product-badges {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
```

### Individual Badges
```css
.badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge.veg {
  background: #22c55e;
}

.badge.non-veg {
  background: #ef4444;
}

.badge.organic {
  background: #22c55e;
}

.badge.fresh {
  background: #3b82f6;
}
```

---

## Product Details

### Brand Name Display
```css
.product-details-brand {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}
```

### Unit and Pack Size
```css
.product-details-unit {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 4px;
}
```

### Product Information
```css
.product-specs {
  background: var(--bg-white);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### Product Specs Grid
```css
.product-specs h3 {
  margin-bottom: 1rem;
  color: var(--text-dark);
}

.product-specs > div {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.product-specs div {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.product-specs div:last-child {
  border-bottom: none;
}

.product-specs strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--text-dark);
}
```

---

## Shop Filters

### Checkbox Filters
```css
.checkbox-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 1rem;
}

.checkbox-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem;
  background: var(--bg-white);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background 0.2s;
}

.checkbox-filter:hover {
  background: #f0f9ff;
}

.checkbox-filter input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-filter span {
  font-size: 0.9rem;
  color: var(--text-dark);
  user-select: none;
}

.checkbox-filter input[type="checkbox"]:checked + span {
  color: var(--primary-pink);
  font-weight: 600;
}
```

### Unit Select
```css
.sidebar-section select.sort-select,
.sidebar-section select[name="unit"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--bg-white);
  font-size: 0.9rem;
  color: var(--text-dark);
}

.sidebar-section select:focus {
  outline: none;
  border-color: var(--primary-pink);
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
}
```

---

## Cart Item

### Unit Display
```css
.cart-item-unit {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}
```

---

## Order Details

### Order Item Price Info
```css
.order-item-price-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.order-item-price {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.order-item-discount {
  font-size: 0.8rem;
  color: #ef4444;
  font-weight: 500;
}
```

### Order Pricing Section
```css
.order-pricing {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--bg-white);
  padding: 1rem;
  border-radius: var(--border-radius);
}

.order-pricing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.order-pricing-row:last-child {
  border-bottom: none;
}

.order-pricing-row.discount-row {
  color: #ef4444;
}

.order-pricing-row.total {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-pink);
  border-top: 2px solid var(--primary-pink);
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}

.order-pricing-row strong:first-child {
  color: var(--text-dark);
}

.order-pricing-row strong:last-child {
  color: var(--text-dark);
}

.order-pricing-row.discount-row strong:first-child {
  color: #ef4444;
}

.order-pricing-row.discount-row strong:last-child {
  color: #ef4444;
}
```

---

## Checkout

### Order Summary Sections
```css
.summary-row.discount-row {
  color: #ef4444;
}

.summary-row.total strong:first-child {
  color: var(--text-dark);
}

.summary-row.total strong:last-child {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-pink);
}

.discount-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}
```

---

## Mobile Styles

### Mobile Filters
```css
.mobile-filter-btn {
  display: none;
}

@media (max-width: 768px) {
  .mobile-filter-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: var(--primary-pink);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .mobile-filter-badge {
    background: #ef4444;
    color: white;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 10px;
  }

  .shop-sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    width: 85%;
    height: 100%;
    background: white;
    z-index: 1000;
    transition: left 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .shop-sidebar.show {
    left: 0;
  }

  .mobile-filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .mobile-filter-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-dark);
  }

  .mobile-filter-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    line-height: 1;
  }

  .mobile-filter-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
}
```

---

## Color Variables

Ensure these CSS variables are defined in your `index.css`:

```css
:root {
  --primary-pink: #ff4081;
  --primary-green: #22c55e;
  --primary-blue: #3b82f6;
  --primary-orange: #f97316;
  --text-dark: #1f2937;
  --text-light: #6b7280;
  --bg-white: #ffffff;
  --border-color: #e5e7eb;
  --border-radius: 12px;
}
```

---

## Animations

### Badge Hover Effect
```css
.badge {
  transition: transform 0.2s, box-shadow 0.2s;
}

.badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
```

### Price Update Animation
```css
@keyframes priceUpdate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.product-card .product-price-wrapper,
.cart-item .cart-item-price {
  animation: priceUpdate 0.3s ease;
}
```

---

## Responsive Adjustments

### Desktop First (Mobile Hidden)
```css
.mobile-filter-btn {
  display: none;
}

@media (min-width: 769px) {
  .mobile-filter-btn {
    display: none;
  }
}
```

### Mobile First (Desktop Hidden)
```css
@media (max-width: 768px) {
  .shop-sidebar {
    position: static;
    width: 100%;
    box-shadow: none;
  }
}
```

---

## Cross-Browser Compatibility

All styles should work across modern browsers:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Implementation Checklist

- [ ] Add all badge styles (veg, non-veg, organic, fresh)
- [ ] Add brand name display style
- [ ] Add unit and pack_size display style
- [ ] Add product details specs grid style
- [ ] Add checkbox filters style
- [ ] Add order pricing section style
- [ ] Add cart item unit display style
- [ ] Add mobile filter sidebar style
- [ ] Update color variables if needed
- [ ] Test responsive layouts
- [ ] Test animations
- [ ] Cross-browser test

---

## Notes

1. All new classes follow the existing naming convention
2. Styles use CSS variables for easy theming
3. Mobile styles use media queries for responsive design
4. Animations are subtle and improve UX without being distracting
5. All new styles are scoped to their components to avoid conflicts
