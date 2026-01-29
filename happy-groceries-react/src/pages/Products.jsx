import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts, getCategories } from '../services/productService.js';
import { useCart } from '../context/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import './Products.css';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
    
    const { addToCart } = useCart();

    // Load products and categories on mount
    useEffect(() => {
        setLoading(true);
        try {
            const allProducts = searchProducts('', 'All', 'name');
            const allCategories = getCategories();
            
            setProducts(allProducts);
            setCategories(allCategories);
            setFilteredProducts(allProducts);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Apply filters when any filter changes
    useEffect(() => {
        setLoading(true);
        try {
            const filtered = searchProducts(searchQuery, selectedCategory, sortBy);
            setFilteredProducts(filtered);
            
            // Update URL params
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (selectedCategory !== 'All') params.set('category', selectedCategory);
            if (sortBy !== 'name') params.set('sort', sortBy);
            setSearchParams(params);
        } catch (error) {
            console.error('Error filtering products:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory, sortBy, setSearchParams]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setSortBy('name');
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (searchQuery) count++;
        if (selectedCategory !== 'All') count++;
        if (sortBy !== 'name') count++;
        return count;
    };

    const handleAddToCart = (product, quantity) => {
        addToCart(product, quantity);
    };

    if (loading && products.length === 0) {
        return (
            <div className="products-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner-large"></div>
                        <p>Loading products...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="products-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">All Products</h1>
                    <p className="page-description">
                        Browse our complete collection of fresh groceries and quality products
                    </p>
                </div>

                {/* Filters Section */}
                <div className="filters-section">
                    <div className="filters-container">
                        {/* Search Bar */}
                        <div className="search-container">
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="search-input"
                                />
                                {searchQuery && (
                                    <button
                                        className="search-clear"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="filter-group">
                            <label htmlFor="category" className="filter-label">
                                Category
                            </label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                className="filter-select"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div className="filter-group">
                            <label htmlFor="sort" className="filter-label">
                                Sort By
                            </label>
                            <select
                                id="sort"
                                value={sortBy}
                                onChange={handleSortChange}
                                className="filter-select"
                            >
                                <option value="name">Name (A-Z)</option>
                                <option value="price-low">Price (Low to High)</option>
                                <option value="price-high">Price (High to Low)</option>
                                <option value="rating">Rating (High to Low)</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {getActiveFiltersCount() > 0 && (
                            <div className="filter-actions">
                                <button className="clear-filters-btn" onClick={clearFilters}>
                                    Clear Filters ({getActiveFiltersCount()})
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Info */}
                <div className="results-info">
                    <div className="results-count">
                        {loading ? (
                            <span>Searching...</span>
                        ) : (
                            <>
                                Showing <strong>{filteredProducts.length}</strong> of{' '}
                                <strong>{products.length}</strong> products
                                {searchQuery && (
                                    <span> for "<strong>{searchQuery}</strong>"</span>
                                )}
                                {selectedCategory !== 'All' && (
                                    <span> in <strong>{selectedCategory}</strong></span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="products-section">
                    {loading ? (
                        <div className="loading-grid">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="product-card-skeleton">
                                    <div className="skeleton-image"></div>
                                    <div className="skeleton-content">
                                        <div className="skeleton-line"></div>
                                        <div className="skeleton-line short"></div>
                                        <div className="skeleton-line"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="no-results">
                            <div className="no-results-icon">🔍</div>
                            <h3 className="no-results-title">No products found</h3>
                            <p className="no-results-message">
                                Try adjusting your search terms or filters to find what you're looking for.
                            </p>
                            <button className="btn btn-primary" onClick={clearFilters}>
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;