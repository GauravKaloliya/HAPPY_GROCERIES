import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';
import { selectSortOptions } from '../store/slices/configSlice';
import { PageLoader } from '../components/LoadingSpinner';
import useActivityLog from '../hooks/useActivityLog';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { logCustomActivity } = useActivityLog('page_view', { section: 'shop' });
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const sortOptions = useSelector(selectSortOptions);
  const PRODUCTS_LIMIT = 6;

  // Filter states
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStock, setInStock] = useState(searchParams.get('in_stock') === 'true');

  const placeholderItems = ['Apples', 'Bananas', 'Milk', 'Chips', 'Tomatoes'];

  // Fetch categories only once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRes = await categoriesAPI.getAll();
        setCategories(categoriesRes.data.results || categoriesRes.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoaded(true);
      }
    };

    if (!categoriesLoaded) {
      fetchCategories();
    }
  }, [categoriesLoaded]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        brand: selectedBrand === 'All' ? '' : selectedBrand,
        ordering: sortBy,
        min_price: minPrice,
        max_price: maxPrice,
        in_stock: inStock ? 'true' : undefined,
        limit: PRODUCTS_LIMIT,
        offset: 0,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const productsRes = await productsAPI.getAll(params);
      const results = productsRes.data.results || productsRes.data;

      setAllProducts(results);
      setTotalCount(productsRes.data.count ?? results.length);
      const uniqueBrands = Array.from(new Set(
        (results || [])
          .map((item) => item.brand_name || item.brand?.name)
          .filter(Boolean)
      )).sort((a, b) => a.localeCompare(b));
      setBrands(uniqueBrands);

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
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, minPrice, maxPrice, inStock, logCustomActivity, PRODUCTS_LIMIT]);

  const handleViewMore = async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const params = {
        search: searchQuery,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        brand: selectedBrand === 'All' ? '' : selectedBrand,
        ordering: sortBy,
        min_price: minPrice,
        max_price: maxPrice,
        in_stock: inStock ? 'true' : undefined,
        limit: PRODUCTS_LIMIT,
        offset: allProducts.length,
      };

      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const productsRes = await productsAPI.getAll(params);
      const results = productsRes.data.results || productsRes.data;

      setAllProducts((prev) => [...prev, ...results]);
      setTotalCount((prev) => productsRes.data.count ?? prev);
    } catch (error) {
      console.error('Error fetching more products:', error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Debounce search to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedBrand && selectedBrand !== 'All') params.brand = selectedBrand;
    if (sortBy) params.sort = sortBy;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (inStock) params.in_stock = 'true';

    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, minPrice, maxPrice, inStock]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSortBy('');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
  };

  const hasFilters = searchQuery || (selectedCategory && selectedCategory !== 'All') || (selectedBrand && selectedBrand !== 'All') || sortBy || minPrice || maxPrice || inStock;
  const hasMoreProducts = allProducts.length < totalCount;

  if (loading && allProducts.length === 0) return <PageLoader />;

  return (
    <div className="container">
      <div className="shop-layout">
        <aside className="shop-sidebar">
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
                className={`category-filter-btn all-option ${!selectedCategory ? 'active' : ''}`}
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
                className={`category-filter-btn all-option ${!selectedBrand ? 'active' : ''}`}
              >
                All Brands
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`category-filter-btn ${selectedBrand === brand ? 'active' : ''}`}
                >
                  {brand}
                </button>
              ))}
            </div>
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

        <div className="shop-content">
          <div className="results-header">
            <p className="results-count">{totalCount} products found</p>
          </div>

          {allProducts.length > 0 ? (
            <>
              <div className="products-grid">
                {allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {hasMoreProducts && (
                <div className="view-more-wrapper">
                  <button
                    className="btn-primary"
                    onClick={handleViewMore}
                    disabled={isFetchingMore}
                  >
                    {isFetchingMore ? 'Loading...' : 'View More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-primary">
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
