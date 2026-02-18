import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Shield, Clock, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { productsAPI } from '../api/products';
import { CATEGORIES } from '../utils/constants';
import { PageLoader } from '../components/LoadingSpinner';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll({ limit: 8 }),
          productsAPI.getCategories(),
        ]);
        setFeaturedProducts(productsRes.data.results || productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageLoader />;

  const features = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders over $50', color: 'bg-blue-100 text-blue-600' },
    { icon: Shield, title: 'Fresh Guarantee', desc: '100% quality assured', color: 'bg-green-100 text-green-600' },
    { icon: Clock, title: 'Fast Delivery', desc: 'Within 2 hours', color: 'bg-pink-100 text-pink-600' },
    { icon: Star, title: 'Best Prices', desc: 'Lowest price guarantee', color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-green-50 to-blue-100 dark:from-pink-900/20 dark:via-green-900/10 dark:to-blue-900/20" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-6xl animate-float opacity-20">🍎</div>
        <div className="absolute top-40 right-20 text-5xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>🥬</div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🥛</div>
        <div className="absolute bottom-40 right-1/3 text-6xl animate-float opacity-20" style={{ animationDelay: '1.5s' }}>🍪</div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm mb-6">
            <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Welcome to the happiest grocery store! 🎉
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Fresh & Happy</span>
            <br />
            <span className="text-gray-800 dark:text-white">Groceries Delivered!</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover over 74 fresh products with cute emoji icons, amazing deals, 
            and super fast delivery. Your daily dose of happiness! 🌟
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="btn-primary flex items-center space-x-2 text-lg px-8 py-4"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/categories"
              className="btn-secondary flex items-center space-x-2 text-lg px-8 py-4"
            >
              <span>Browse Categories</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '74+', label: 'Products' },
              { value: '5', label: 'Categories' },
              { value: '2hr', label: 'Delivery' },
              { value: '⭐ 4.9', label: 'Rating' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass p-6 rounded-2xl text-center card-hover"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Shop by Category</span> 🗂️
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Explore our wide range of fresh products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="gradient-text">Featured Products</span> ✨
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Handpicked favorites just for you
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden md:flex items-center space-x-2 text-pink-500 font-medium hover:text-pink-600 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 btn-primary"
            >
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 p-8 md:p-16 text-center">
            <div className="absolute inset-0 bg-black/10" />
            
            {/* Decorative Elements */}
            <div className="absolute top-4 left-4 text-6xl opacity-30">🛒</div>
            <div className="absolute bottom-4 right-4 text-6xl opacity-30">🎁</div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Ready to Shop Happy? 🎉
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of happy customers and get fresh groceries delivered 
                to your door. Use code WELCOME50 for $50 off your first order!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="bg-white text-pink-500 font-bold px-8 py-4 rounded-full hover:shadow-xl transition-all hover:scale-105"
                >
                  Create Account 🚀
                </Link>
                <Link
                  to="/shop"
                  className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white/10 transition-all"
                >
                  Browse as Guest
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
