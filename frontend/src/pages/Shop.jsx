import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api/products';
import { CATEGORIES, SORT_OPTIONS } from '../utils/constants';
import { PageLoader, SkeletonCard } from '../components/LoadingSpinner';
import { debounce } from '../utils/helpers';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-rating');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min_price') || '',
    max: searchParams.get('max_price') || '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        category: selectedCategory,
        ordering: sortBy,
        min_price: priceRange.min,
        max_price: priceRange.max,
      };
      
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await productsAPI.getAll(params);
      setProducts(response.data.results || response.data);
      setTotalCount(response.data.count || response.data.length);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const debouncedFetch = useCallback(debounce(fetchProducts, 300), [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (sortBy !== '-rating') params.sort = sortBy;
    if (priceRange.min) params.min_price = priceRange.min;
    if (priceRange.max) params.max_price = priceRange.max;
    
    setSearchParams(params);
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('-rating');
    setPriceRange({ min: '', max: '' });
  };

  const hasFilters = searchQuery || selectedCategory || sortBy !== '-rating' || priceRange.min || priceRange.max;

  const categoryEmojis = {
    fruits: '🍎',
    vegetables: '🥬',
    dairy: '🥛',
    snacks: '🍪',
    beverages: '🧃',
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text">Shop All Products</span> 🛍️
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {loading ? 'Loading products...' : `${totalCount} products found`}
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for fresh products..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-pink-400 focus:border-transparent shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {hasFilters && <span className="w-2 h-2 rounded-full bg-pink-500" />}
            </button>

            {/* Category Filter - Desktop */}
            <div className="hidden lg:flex items-center space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-pink-400'
                }`}
              >
                All Products
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center space-x-2 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-pink-400'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-pink-400 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="lg:hidden glass p-4 rounded-2xl space-y-4">
              <div>
                <label className="font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      !selectedCategory
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center space-x-1 ${
                        selectedCategory === cat.id
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-pink-500 hover:text-pink-600 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
