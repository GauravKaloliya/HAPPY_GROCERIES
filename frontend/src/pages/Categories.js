import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/UI/ProductCard';
import { productsAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/UI/Toast';

const Categories = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCategories();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
      fetchProductsByCategory(category);
    } else {
      setSelectedCategory(null);
      setProducts([]);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryName) => {
    setLoading(true);
    try {
      const category = categories.find(c => c.name === categoryName);
      if (category) {
        const response = await productsAPI.getByCategory(category.id);
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
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

  if (loading && categories.length === 0) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">🎨 Categories</h1>

      {!selectedCategory ? (
        // Show category cards
        <div className="categories-grid">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/categories?category=${category.name}`}
              className="category-card"
              style={{ background: category.color }}
            >
              <span className="category-emoji">{category.emoji}</span>
              <h3>{category.name}</h3>
              <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
                {category.product_count || 'Many'} products
              </p>
            </Link>
          ))}
        </div>
      ) : (
        // Show products for selected category
        <>
          <div style={{ marginBottom: '2rem' }}>
            <Link to="/categories" className="btn-secondary">
              ← Back to Categories
            </Link>
          </div>
          
          <h2 className="section-title">{selectedCategory}</h2>
          
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No products in this category</h3>
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
        </>
      )}
    </div>
  );
};

export default Categories;
