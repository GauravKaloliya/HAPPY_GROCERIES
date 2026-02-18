import { Link } from 'react-router-dom';
import { CATEGORIES } from '../utils/constants';

const CategoryCard = ({ category }) => {
  const cat = CATEGORIES.find(c => c.id === category.id) || category;
  
  return (
    <Link
      to={`/shop?category=${cat.id}`}
      className="group block"
    >
      <div 
        className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
        style={{ backgroundColor: `${cat.color}30` }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-4 -right-4 text-8xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
            {cat.emoji}
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4 transform group-hover:scale-110 transition-transform"
            style={{ backgroundColor: cat.color }}
          >
            {cat.emoji}
          </div>
          
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
            {cat.name}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {category.product_count || 0} products
          </p>
          
          <div className="mt-4 flex items-center text-sm font-medium" style={{ color: cat.color.replace('100', '600').replace('EB', '33') }}>
            <span>Explore</span>
            <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
