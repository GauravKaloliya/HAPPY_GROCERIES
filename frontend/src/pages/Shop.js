import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/UI/ProductCard';
import { productsAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/UI/Toast';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('default');
  const { isAuthenticated } = useAuth();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsAPI.search(searchQuery, selectedCategory, sortBy);
      setProducts(response.data.results);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [fetchProducts, isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.get();
      setWishlist(response.data.products.map(p => p.id));
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    setSearchParams(params);
    fetchProducts();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category !== 'All') params.set('category', category);
    setSearchParams(params);
  };

  const handleWishlistToggle = async (productId) => {
    if (!isAuthenticated) {
      showToast('Please login to use wishlist');
      return;
    }

    try {
      const response = await wishlistAPI.toggle(productId);
      if (response.data.action === 'added') {
        setWishlist([...wishlist, productId]);
        showToast('Added to wishlist 💖');
      } else {
        setWishlist(wishlist.filter(id => id !== productId));
        showToast('Removed from wishlist');
      }
    } catch (error) {
      showToast('Failed to update wishlist');
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  return (
    <div className="container">
      <h1 className="section-title">🛍️ Shop</h1>

      {/* Search Section */}
      <section className="search-section">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>

        <div className="filters">
          <button
            className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('All')}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-btn ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.name)}
            >
              {category.name}
            </button>
          ))}

          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Sort by</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </section>

      <p className="results-count">
        {loading ? 'Loading...' : `${products.length} products found`}
      </p>

      {loading ? (
        <div className="spinner"></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">😢</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={isInWishlist(product.id)}
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
