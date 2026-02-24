import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';
import { brandsAPI } from '../api/brands';
import { selectSortOptions } from '../store/slices/configSlice';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { logCustomActivity } = useActivityLog('page_view', { section: 'shop' });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sortOptions = useSelector(selectSortOptions);

  // Filter states
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedUnit, setSelectedUnit] = useState(searchParams.get('unit') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStock, setInStock] = useState(searchParams.get('in_stock') === 'true');
  const [isVeg, setIsVeg] = useState(searchParams.get('is_veg') === 'true');
  const [isOrganic, setIsOrganic] = useState(searchParams.get('is_organic') === 'true');
  const [isFresh, setIsFresh] = useState(searchParams.get('is_fresh') === 'true');

  const placeholderItems = ['Apples', 'Bananas', 'Milk', 'Chips', 'Tomatoes'];

  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'mg', label: 'Milligram (mg)' },
    { value: 'ltr', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'piece', label: 'Piece (pcs)' },
    { value: 'pack', label: 'Pack' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'bunch', label: 'Bunch' },
    { value: 'bottle', label: 'Bottle' },
    { value: 'can', label: 'Can' },
    { value: 'box', label: 'Box' },
    { value: 'jar', label: 'Jar' },
    { value: 'other', label: 'Other' },
  ];

  // Fetch categories and brands only once
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          categoriesAPI.getAll(),
          brandsAPI.getAll(),
        ]);
        setCategories(categoriesRes.data.results || categoriesRes.data);
        setBrands(brandsRes.data.results || brandsRes.data);
      } catch (error) {
        console.error('Error fetching filters:', error);
      } finally {
        setCategoriesLoaded(true);
      }
    };

    if (!categoriesLoaded) {
      fetchFiltersData();
    }
  }, [categoriesLoaded]);

  const fetchProducts = useCallback(async (page = 1, append = false) => {
    if (!append) {
      setLoading(true);
    }
    try {
      const params = {
        search: searchQuery,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        brand: selectedBrand,
        unit: selectedUnit,
        ordering: sortBy,
        min_price: minPrice,
        max_price: maxPrice,
        in_stock: inStock ? 'true' : undefined,
        is_veg: isVeg ? 'true' : undefined,
        is_organic: isOrganic ? 'true' : undefined,
        is_fresh: isFresh ? 'true' : undefined,
        page: page,
        page_size: 10,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const productsRes = await productsAPI.getAll(params);
      const newProducts = productsRes.data.results || productsRes.data;
      const count = productsRes.data.count || productsRes.data.length;

      if (append) {
        setProducts(prev => {
          setHasMore(newProducts.length === 10 && (prev.length + newProducts.length) < count);
          return [...prev, ...newProducts];
        });
      } else {
        setProducts(newProducts);
        setHasMore(newProducts.length === 10 && newProducts.length < count);
      }
      setTotalCount(count);

      // Log search/filter activity
      if (searchQuery) {
        logCustomActivity('search', { query: searchQuery });
      }
      if (selectedCategory) {
        logCustomActivity('filter_apply', { type: 'category', value: selectedCategory });
      }
      if (selectedBrand) {
        logCustomActivity('filter_apply', { type: 'brand', value: selectedBrand });
      }
      if (sortBy) {
        logCustomActivity('filter_apply', { type: 'sort', value: sortBy });
      }
      if (minPrice || maxPrice) {
        logCustomActivity('filter_apply', { type: 'price_range', min: minPrice, max: maxPrice });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrand, selectedUnit, sortBy, minPrice, maxPrice, inStock, isVeg, isOrganic, isFresh, logCustomActivity]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchProducts(nextPage, true);
  };

  // Debounce search to reduce API calls
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    const timer = setTimeout(() => {
      fetchProducts(1, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedBrand) params.brand = selectedBrand;
    if (selectedUnit) params.unit = selectedUnit;
    if (sortBy) params.sort = sortBy;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (inStock) params.in_stock = 'true';
    if (isVeg) params.is_veg = 'true';
    if (isOrganic) params.is_organic = 'true';
    if (isFresh) params.is_fresh = 'true';

    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, selectedBrand, selectedUnit, sortBy, minPrice, maxPrice, inStock, isVeg, isOrganic, isFresh]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedUnit('');
    setSortBy('');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setIsVeg(false);
    setIsOrganic(false);
    setIsFresh(false);
  };

  const hasFilters = searchQuery || (selectedCategory && selectedCategory !== 'All') || selectedBrand || selectedUnit || sortBy || minPrice || maxPrice || inStock || isVeg || isOrganic || isFresh;

  if (loading && products.length === 0) return <PageLoader />;

  return (
    <div className="container">
      {/* Mobile Filter Button */}
      <button
        className="mobile-filter-btn"
        onClick={() => setShowMobileFilters(true)}
      >
        🔍 Filters & Sort
        {hasFilters && <span className="mobile-filter-badge">{products.length}</span>}
      </button>

      <div className="shop-layout">
        <aside className={`shop-sidebar ${showMobileFilters ? 'show' : ''}`}>
          <div className="mobile-filter-header">
            <h3 className="mobile-filter-title">Filters</h3>
            <button
              className="mobile-filter-close"
              onClick={() => setShowMobileFilters(false)}
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Search</h3>
            <div className="search-bar">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearchQuery(e.target.value);
                    }
                  }}
                  onBlur={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  placeholder="Search"
                />
                {!searchInput && (
                  <div className="search-placeholder" aria-hidden="true">
                    <span className="search-placeholder-label">Search</span>
                    <span className="search-placeholder-rotator">
                      <span className="rotator-track">
                        {placeholderItems.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Categories</h3>
            <div className="category-filters">
              <button
                onClick={() => setSelectedCategory('')}
                className={`category-filter-btn ${!selectedCategory ? 'active' : ''}`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id || cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`category-filter-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Brands</h3>
            <div className="category-filters">
              <button
                onClick={() => setSelectedBrand('')}
                className={`category-filter-btn ${!selectedBrand ? 'active' : ''}`}
              >
                All Brands
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id || brand.name}
                  onClick={() => setSelectedBrand(brand.name)}
                  className={`category-filter-btn ${selectedBrand === brand.name ? 'active' : ''}`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Unit Type</h3>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="sort-select"
            >
              <option value="">All Units</option>
              {unitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Price Range</h3>
            <div className="price-filters">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                min="0"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || parseFloat(val) >= 0) setMinPrice(val);
                }}
                className="price-input"
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                min="0"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || parseFloat(val) >= 0) setMaxPrice(val);
                }}
                className="price-input"
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="">Default</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Product Type</h3>
            <div className="checkbox-filters">
              <label className="checkbox-filter">
                <input
                  type="checkbox"
                  checked={isVeg}
                  onChange={(e) => setIsVeg(e.target.checked)}
                />
                <span>Vegetarian Only</span>
              </label>
              <label className="checkbox-filter">
                <input
                  type="checkbox"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                />
                <span>Organic Only</span>
              </label>
              <label className="checkbox-filter">
                <input
                  type="checkbox"
                  checked={isFresh}
                  onChange={(e) => setIsFresh(e.target.checked)}
                />
                <span>Fresh Only</span>
              </label>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Availability</h3>
            <label className="stock-filter">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
              />
              In Stock Only
            </label>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="btn-clear-all"
            >
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div
            className="mobile-filter-overlay"
            onClick={() => setShowMobileFilters(false)}
          />
        )}

        <div className="shop-content">
          <div className="results-header">
            <p className="results-count">{totalCount} products found</p>
          </div>

          {products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={handleLoadMore}
                    className="btn-primary"
                    style={{ padding: '0.75rem 2rem' }}
                  >
                    View More Products
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-primary" style={{ marginTop: '1rem' }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
