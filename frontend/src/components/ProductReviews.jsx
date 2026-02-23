import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchProductReviews,
  fetchReviewSummary,
  createReview,
  markReviewHelpful,
  selectProductReviews,
  selectReviewSummary,
  selectReviewsLoading,
} from '../store/slices/reviewsSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';

const StarSvg = ({ filled, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? '#f59e0b' : 'none'}
    stroke="#f59e0b"
    strokeWidth="1.5"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const renderStars = (rating, size = 16) => {
  const fullStars = Math.round(rating);
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarSvg key={i} filled={i <= fullStars} size={size} />
      ))}
    </span>
  );
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ProductReviews = ({ productId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reviews = useSelector((state) => selectProductReviews(state, productId));
  const summary = useSelector((state) => selectReviewSummary(state, productId));
  const loading = useSelector(selectReviewsLoading);

  const [showWriteForm, setShowWriteForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProductReviews(productId));
    dispatch(fetchReviewSummary(productId));
  }, [dispatch, productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(createReview({
        productId,
        reviewData: { rating, title, comment }
      })).unwrap();
      toast.success('Review submitted successfully!');
      setShowWriteForm(false);
      setRating(5);
      setTitle('');
      setComment('');
      dispatch(fetchReviewSummary(productId));
    } catch (err) {
      toast.error(err || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error('Please login to mark helpful');
      return;
    }
    try {
      await dispatch(markReviewHelpful(reviewId)).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to mark helpful');
    }
  };

  if (loading && !reviews.length) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading reviews...</div>;
  }

  return (
    <div className="product-reviews" style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Customer Reviews {summary?.total_reviews > 0 && `(${summary.total_reviews})`}
      </h3>

      {summary && (
        <div className="review-summary" style={{
          background: 'var(--bg-white)',
          padding: '1.5rem',
          borderRadius: 'var(--border-radius)',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', minWidth: '100px' }}>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary-pink)', lineHeight: 1 }}>
                {summary.average_rating.toFixed(1)}
              </div>
              <div style={{ marginTop: '0.4rem' }}>{renderStars(summary.average_rating, 18)}</div>
              <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {summary.total_reviews} {summary.total_reviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.rating_breakdown[star] || 0;
                const pct = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', width: '52px', flexShrink: 0, fontSize: '0.85rem', color: 'var(--text-dark)' }}>
                      {star}
                      <StarSvg filled size={13} />
                    </span>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      background: '#eee',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--primary-pink)',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    <span style={{ width: '28px', textAlign: 'right', fontSize: '0.82rem', color: '#888', flexShrink: 0 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center' }}>
              {summary.can_review ? (
                <button
                  onClick={() => setShowWriteForm(!showWriteForm)}
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  {showWriteForm ? 'Cancel' : 'Write a Review'}
                </button>
              ) : summary.user_review ? (
                <div style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                  ✓ You reviewed this product
                </div>
              ) : !isAuthenticated ? (
                <button
                  onClick={() => navigate('/login')}
                  className="btn-secondary"
                  style={{ padding: '0.6rem 1.2rem' }}
                >
                  Login to Review
                </button>
              ) : (
                <div style={{ color: '#888', fontSize: '0.9rem' }}>
                  Purchase to review
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showWriteForm && (
        <div className="write-review-form" style={{
          background: 'var(--bg-white)',
          padding: '1.5rem',
          borderRadius: 'var(--border-radius)',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow)',
        }}>
          <h4 style={{ marginBottom: '1rem' }}>Write Your Review</h4>
          <form onSubmit={handleSubmitReview}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Rating
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <StarSvg filled={star <= (hoverRating || rating)} size={28} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: 'var(--border-radius)',
                  fontFamily: 'inherit',
                }}
                maxLength={100}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: 'var(--border-radius)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                maxLength={1000}
                required
              />
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                {comment.length}/1000
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ opacity: submitting ? 0.5 : 1 }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#888',
            background: 'var(--bg-white)',
            borderRadius: 'var(--border-radius)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📝</div>
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="review-item"
              style={{
                background: 'var(--bg-white)',
                padding: '1.5rem',
                borderRadius: 'var(--border-radius)',
                marginBottom: '1rem',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    {renderStars(review.rating)}
                  </div>
                  {review.title && (
                    <h4 style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{review.title}</h4>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#888' }}>
                  {formatDate(review.created_at)}
                </div>
              </div>

              <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>{review.comment}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: '#888' }}>
                  By {review.user_name || review.user_phone}
                  {review.is_verified_purchase && (
                    <span style={{ color: 'var(--primary-green)', marginLeft: '0.5rem' }}>
                      ✓ Verified Purchase
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleHelpful(review.id)}
                  style={{
                    background: review.user_has_voted ? 'var(--primary-pink)' : 'transparent',
                    color: review.user_has_voted ? 'white' : 'var(--text-dark)',
                    border: '1px solid #ddd',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  👍 Helpful ({review.helpful_count})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
