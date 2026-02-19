// Tax and delivery settings
export const TAX_RATE = 0.08;
export const DELIVERY_CHARGE = 40;  // Standard delivery charge
export const EXPRESS_DELIVERY_CHARGE = 50;  // Express delivery charge (fixed at 50)
export const FREE_DELIVERY_THRESHOLD = 500;

// Sort options for products
export const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-name', label: 'Name (Z-A)' },
  { value: 'price', label: 'Price (Low to High)' },
  { value: '-price', label: 'Price (High to Low)' },
  { value: '-rating', label: 'Highest Rated' },
];
