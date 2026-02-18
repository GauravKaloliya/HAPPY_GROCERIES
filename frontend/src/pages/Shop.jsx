import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api/products';
import { categoriesAPI } from '../api/categories';
import { PageLoader } from '../components/LoadingSpinner';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        ordering: sortBy,
      };
      
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(params),
        categoriesAPI.getAll(),
      ]);
      
      setProducts(productsRes.data.results || productsRes.data);
      setTotalCount(productsRes.data.count || productsRes.data.length);
      setCategories(categoriesRes.data.results || categoriesRes.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    if (sortBy) params.sort = sortBy;
    
    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('');
  };

  const hasFilters = searchQuery || (selectedCategory && selectedCategory !== 'All') || sortBy;

  if (loading) return <PageLoader />;

  return (
    <div className="container">
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyUp={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
          />
        </div>

        <div className="filters">
          <button
            onClick={() => setSelectedCategory('')}
            className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`filter-btn ${selectedCategory === cat.name ? 'active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="">Sort by</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
            <option value="-rating">Rating: High to Low</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="filter-btn"
              style={{ marginLeft: 'auto' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <p className="results-count">{totalCount} products found</p>

      {products.length > 0 ? (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
  );
};

export default Shop;
