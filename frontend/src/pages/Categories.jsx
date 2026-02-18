import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api/products';
import { CATEGORIES } from '../utils/constants';
import { PageLoader, SkeletonCard } from '../components/LoadingSpinner';

const Categories = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productsAPI.getCategories();
        // Merge API categories with our constant categories
        const merged = CATEGORIES.map(cat => {
          const apiCat = response.data.find(c => c.id === cat.id);
          return { ...cat, ...apiCat, product_count: apiCat?.product_count || 0 };
        });
        setCategories(merged);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const response = await productsAPI.getByCategory(selectedCategory);
          setCategoryProducts(response.data.results || response.data);
        } catch (error) {
          console.error('Error fetching category products:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    } else {
      setCategoryProducts([]);
      setLoading(false);
    }
  }, [selectedCategory]);

  if (loading && !categories.length) return <PageLoader />;

  const selectedCatData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Browse Categories</span> 📂
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our wide range of fresh products organized by category. 
            Click on any category to see what's inside!
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 text-left ${
                selectedCategory === category.id
                  ? 'ring-4 ring-pink-400 scale-105'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: `${category.color}40` }}
            >
              <div className="relative z-10">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                  style={{ backgroundColor: category.color }}
                >
                  {category.emoji}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {category.product_count} products
                </p>
              </div>
              
              {/* Decorative */}
              <div className="absolute -bottom-4 -right-4 text-6xl opacity-20">
                {category.emoji}
              </div>
            </button>
          ))}
        </div>

        {/* Selected Category Products */}
        {selectedCategory && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: selectedCatData?.color }}
                >
                  {selectedCatData?.emoji}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedCatData?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {categoryProducts.length} products available
                  </p>
                </div>
              </div>
              <Link
                to={`/shop?category=${selectedCategory}`}
                className="flex items-center space-x-2 text-pink-500 font-medium hover:text-pink-600 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : categoryProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 glass rounded-2xl">
                <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This category is currently empty
                </p>
              </div>
            )}
          </div>
        )}

        {/* All Categories Overview */}
        {!selectedCategory && (
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category.id} className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.emoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {category.product_count} products
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/shop?category=${category.id}`}
                    className="flex items-center space-x-2 text-pink-500 font-medium hover:text-pink-600 transition-colors"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Preview Items */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl flex items-center justify-center text-4xl"
                      style={{ backgroundColor: `${category.color}30` }}
                    >
                      {category.emoji}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
