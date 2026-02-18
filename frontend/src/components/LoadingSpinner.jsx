const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin`}
      />
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
    <div className="relative">
      <span className="text-6xl animate-bounce-gentle">🛒</span>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/10 rounded-full animate-pulse" />
    </div>
    <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400 animate-pulse">
      Loading fresh goodies...
    </p>
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
    <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
      <div className="flex items-center space-x-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {[...Array(lines)].map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
        style={{ width: `${100 - i * 20}%` }}
      />
    ))}
  </div>
);

export default LoadingSpinner;
