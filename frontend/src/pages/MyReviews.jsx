import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchMyReviews,
  fetchPendingReviews,
  deleteReview,
  selectMyReviews,
  selectPendingReviews,
  selectReviewsLoading,
} from '../store/slices/reviewsSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';

const MyReviews = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const myReviews = useSelector(selectMyReviews);
  const pendingReviews = useSelector(selectPendingReviews);
  const loading = useSelector(selectReviewsLoading);
  const [activeTab, setActiveTab] = useState('my-reviews');
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchMyReviews());
    dispatch(fetchPendingReviews());
  }, [dispatch, isAuthenticated, navigate]);
  
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    setDeleteLoading(reviewId);
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      toast.success('Review deleted successfully');
    } catch (err) {
      toast.error(err || 'Failed to delete review');
    } finally {
      setDeleteLoading(null);
    }
  };
  
  const renderStars = (rating) => '⭐'.repeat(rating);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <h1 className="section-title">⭐ My Reviews</h1>
      
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid var(--primary-pink)',
      }}>
        <button
          onClick={() => setActiveTab('my-reviews')}
          style={{
            padding: '1rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'my-reviews' ? '3px solid var(--primary-pink)' : 'none',
            fontWeight: 600,
            cursor: 'pointer',
            color: activeTab === 'my-reviews' ? 'var(--primary-pink)' : 'var(--text-dark)',
          }}
        >
          My Reviews ({myReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '1rem 1.5rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid var(--primary-pink)' : 'none',
            fontWeight: 600,
            cursor: 'pointer',
            color: activeTab === 'pending' ? 'var(--primary-pink)' : 'var(--text-dark)',
          }}
        >
          Pending Reviews ({pendingReviews.length})
        </button>
      </div>
      
      {loading && !myReviews.length && !pendingReviews.length ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
      ) : activeTab === 'my-reviews' ? (
        <div className="my-reviews-list">
          {myReviews.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'var(--bg-white)',
              borderRadius: 'var(--border-radius)',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
              <h3>No reviews yet</h3>
              <p style={{ color: '#888', marginBottom: '1rem' }}>
                You haven't reviewed any products yet.
              </p>
              <Link to="/orders" className="btn-primary">
                View Your Orders
              </Link>
            </div>
          ) : (
            myReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  background: 'var(--bg-white)',
                  padding: '1.5rem',
                  borderRadius: 'var(--border-radius)',
                  marginBottom: '1rem',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'var(--bg-light)',
                      borderRadius: 'var(--border-radius)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                    }}
                  >
                    {review.product?.emoji || '📦'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link
                      to={`/product/${review.product?.id}`}
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        color: 'var(--text-dark)',
                        textDecoration: 'none',
                      }}
                    >
                      {review.product?.name}
                    </Link>
                    <div style={{ marginTop: '0.5rem' }}>
                      {renderStars(review.rating)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                      Reviewed on {formatDate(review.created_at)}
                    </div>
                  </div>
                </div>
                
                {review.title && (
                  <h4 style={{ marginBottom: '0.5rem' }}>{review.title}</h4>
                )}
                <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{review.comment}</p>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Link
                    to={`/product/${review.product?.id}`}
                    className="btn-secondary"
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                  >
                    View Product
                  </Link>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deleteLoading === review.id}
                    style={{
                      background: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--border-radius)',
                      cursor: deleteLoading === review.id ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      opacity: deleteLoading === review.id ? 0.5 : 1,
                    }}
                  >
                    {deleteLoading === review.id ? 'Deleting...' : 'Delete Review'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="pending-reviews-list">
          {pendingReviews.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'var(--bg-white)',
              borderRadius: 'var(--border-radius)',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
              <h3>No pending reviews</h3>
              <p style={{ color: '#888', marginBottom: '1rem' }}>
                You've reviewed all your purchased products!
              </p>
              <Link to="/shop" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          ) : (
            pendingReviews.map((product) => (
              <div
                key={product.id}
                style={{
                  background: 'var(--bg-white)',
                  padding: '1.5rem',
                  borderRadius: 'var(--border-radius)',
                  marginBottom: '1rem',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--bg-light)',
                    borderRadius: 'var(--border-radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                  }}
                >
                  {product.emoji || '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <Link
                    to={`/product/${product.id}`}
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      color: 'var(--text-dark)',
                      textDecoration: 'none',
                    }}
                  >
                    {product.name}
                  </Link>
                  <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.25rem' }}>
                    {product.category?.name || product.category}
                  </div>
                </div>
                <Link
                  to={`/product/${product.id}`}
                  className="btn-primary"
                  style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                >
                  Write Review
                </Link>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyReviews;
