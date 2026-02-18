const LoadingSpinner = () => {
  return <div className="spinner"></div>;
};

export const PageLoader = () => (
  <div style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <div className="spinner"></div>
    <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading...</p>
  </div>
);

export const SkeletonCard = () => (
  <div className="product-card">
    <div style={{ height: '200px', background: 'var(--bg-light)', borderRadius: 'var(--border-radius)', marginBottom: '1rem' }} />
    <div style={{ height: '20px', background: 'var(--bg-light)', borderRadius: '10px', marginBottom: '0.5rem', width: '60%' }} />
    <div style={{ height: '16px', background: 'var(--bg-light)', borderRadius: '8px', marginBottom: '0.5rem', width: '40%' }} />
    <div style={{ height: '24px', background: 'var(--bg-light)', borderRadius: '12px', width: '30%' }} />
  </div>
);

export default LoadingSpinner;
