import { useState } from 'react';

const ShopSidebar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  inStock,
  onInStockChange,
  sortBy,
  onSortChange,
  onClearFilters,
  hasFilters
}) => {
  const [priceRangeOpen, setPriceRangeOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(true);

  return (
    <aside className="shop-sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title" onClick={() => setCategoryOpen(!categoryOpen)}>
          Category {categoryOpen ? '▼' : '▶'}
        </h3>
        {categoryOpen && (
          <div className="sidebar-content">
            <label className="sidebar-item">
              <input
                type="radio"
                name="category"
                checked={!selectedCategory}
                onChange={() => onCategoryChange('')}
              />
              <span>All Categories</span>
            </label>
            {categories.map((cat) => (
              <label key={cat.id || cat.name} className="sidebar-item">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat.name}
                  onChange={() => onCategoryChange(cat.name)}
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title" onClick={() => setPriceRangeOpen(!priceRangeOpen)}>
          Price Range {priceRangeOpen ? '▼' : '▶'}
        </h3>
        {priceRangeOpen && (
          <div className="sidebar-content">
            <div className="price-range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="price-range-input"
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="price-range-input"
              />
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title" onClick={() => setAvailabilityOpen(!availabilityOpen)}>
          Availability {availabilityOpen ? '▼' : '▶'}
        </h3>
        {availabilityOpen && (
          <div className="sidebar-content">
            <label className="sidebar-item">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => onInStockChange(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title" onClick={() => setSortOpen(!sortOpen)}>
          Sort By {sortOpen ? '▼' : '▶'}
        </h3>
        {sortOpen && (
          <div className="sidebar-content">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="sidebar-select"
            >
              <option value="">Default</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="-rating">Rating: High to Low</option>
            </select>
          </div>
        )}
      </div>

      {hasFilters && (
        <button onClick={onClearFilters} className="btn-md btn-primary w-full">
          Clear All Filters
        </button>
      )}
    </aside>
  );
};

export default ShopSidebar;
