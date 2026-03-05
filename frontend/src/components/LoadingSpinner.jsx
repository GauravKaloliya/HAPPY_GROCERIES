const LoadingSpinner = () => {
  return <div className="spinner"></div>;
};

export const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner"></div>
    <p className="page-loader-text">Loading...</p>
  </div>
);

export const SkeletonCard = () => (
  <div className="product-card">
    <div className="product-skeleton-image" />
    <div className="product-skeleton-title" />
    <div className="product-skeleton-meta" />
    <div className="product-skeleton-price" />
  </div>
);

export default LoadingSpinner;
