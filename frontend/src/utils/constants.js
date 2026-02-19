// DEPRECATED: All settings below are now fetched from the API via configSlice
// These defaults are kept only for fallback purposes
// Use selectors from configSlice: selectTaxRate, selectStandardDeliveryCharge, etc.

// Fallback defaults (used only if API fails)
export const DEFAULT_TAX_RATE = 0.08;
export const DEFAULT_DELIVERY_CHARGE = 40;
export const DEFAULT_EXPRESS_DELIVERY_CHARGE = 50;
export const DEFAULT_FREE_DELIVERY_THRESHOLD = 500;

// Note: Sort options are now fetched from /api/config/sort-options/
// Use selectSortOptions from configSlice

// DEPRECATED: This will be removed in future versions
// Sort options are now dynamic from the database
export const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-name', label: 'Name (Z-A)' },
  { value: 'price', label: 'Price (Low to High)' },
  { value: '-price', label: 'Price (High to Low)' },
  { value: '-rating', label: 'Highest Rated' },
];
