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

  const getReviewProduct = (review) => (
    review && typeof review.product === 'object' ? review.product : null
  );

  const getReviewProductId = (review) => {
    const productObj = getReviewProduct(review);
    if (productObj?.id) return productObj.id;
    if (typeof review?.product === 'number' || typeof review?.product === 'string') return review.product;
    return null;
  };

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
    <div className="container">
      <h1 className="section-title">⭐ My Reviews</h1>

      {/* Tabs */}
      <div className="reviews-tabs">
        <button
          onClick={() => setActiveTab('my-reviews')}
          className={`reviews-tab ${activeTab === 'my-reviews' ? 'active' : ''}`}
        >
          My Reviews ({myReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`reviews-tab ${activeTab === 'pending' ? 'active' : ''}`}
        >
          Pending Reviews ({pendingReviews.length})
        </button>
      </div>

      {loading && !myReviews.length && !pendingReviews.length ? (
        <div className="reviews-loading">Loading...</div>
      ) : activeTab === 'my-reviews' ? (
        <div className="my-reviews-list">
          {myReviews.length === 0 ? (
            <div className="reviews-empty-state">
              <div className="reviews-empty-icon">📝</div>
              <h3>No reviews yet</h3>
              <p>You haven't reviewed any products yet.</p>
              <Link to="/orders" className="btn-primary">
                View Your Orders
              </Link>
            </div>
          ) : (
            myReviews.map((review) => (
              <div key={review.id} className="my-review-card">
                {(() => {
                  const productObj = getReviewProduct(review);
                  const productId = getReviewProductId(review);
                  return (
                    <>
                <div className="review-item-header">
                  <div className="review-product-thumb">
                    {productObj?.emoji || '📦'}
                  </div>
                  <div>
                    <Link
                      to={productId ? `/product/${productId}` : '#'}
                      className="review-product-link"
                    >
                      {productObj?.name || `Product #${productId || 'N/A'}`}
                    </Link>
                    <div className="review-stars">
                      {renderStars(review.rating)}
                    </div>
                    <div className="review-date">
                      Reviewed on {formatDate(review.created_at)}
                    </div>
                    <div className="review-item-meta-line">
                      {[
                        productObj?.brand?.name || productObj?.brand_name,
                        productObj?.default_variant?.variant_name,
                        productObj?.default_variant?.sku && `SKU: ${productObj.default_variant.sku}`,
                        productObj?.default_variant?.unit_type && productObj?.default_variant?.unit_value
                          ? `${productObj.default_variant.unit_value} ${productObj.default_variant.unit_type}`
                          : productObj?.default_variant?.unit_type || null,
                      ].filter(Boolean).join(' • ') || 'Product details'}
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h4>{review.title}</h4>
                )}
                <p>{review.comment}</p>

                <div className="review-item-actions">
                  <Link
                    to={productId ? `/product/${productId}` : '#'}
                    className="btn-secondary"
                  >
                    View Product
                  </Link>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deleteLoading === review.id}
                    className="btn-danger"
                  >
                    {deleteLoading === review.id ? 'Deleting...' : 'Delete Review'}
                  </button>
                </div>
                    </>
                  );
                })()}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="pending-reviews-list">
          {pendingReviews.length === 0 ? (
            <div className="reviews-empty-state">
              <div className="reviews-empty-icon">✅</div>
              <h3>No pending reviews</h3>
              <p>You've reviewed all your purchased products!</p>
              <Link to="/shop" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          ) : (
            pendingReviews.map((product) => (
              <div key={product.id} className="my-review-card">
                <div className="review-item-header">
                  <div className="review-product-thumb">
                    {product.emoji || '📦'}
                  </div>
                  <div>
                    <Link
                      to={`/product/${product.id}`}
                      className="review-product-link"
                    >
                      {product.name}
                    </Link>
                    <div className="review-category-text">
                      {product.category?.name || product.category}
                    </div>
                    <div className="review-item-meta-line">
                      {[
                        product.brand?.name || product.brand_name,
                        product.default_variant?.variant_name,
                        product.default_variant?.sku && `SKU: ${product.default_variant.sku}`,
                        product.default_variant?.unit_type && product.default_variant?.unit_value
                          ? `${product.default_variant.unit_value} ${product.default_variant.unit_type}`
                          : product.default_variant?.unit_type || null,
                      ].filter(Boolean).join(' • ') || 'Variant details'}
                    </div>
                  </div>
                  <Link
                    to={`/product/${product.id}`}
                    className="btn-primary"
                  >
                    Write Review
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyReviews;
