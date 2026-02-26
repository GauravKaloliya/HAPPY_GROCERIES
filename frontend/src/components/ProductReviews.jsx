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
  const TITLE_MAX = 100;
  const COMMENT_MIN = 10;
  const COMMENT_MAX = 1000;
  const TITLE_PATTERN = /^[a-zA-Z0-9\s.,!?'"()\-_&@#%:;]+$/;
  const sanitizeText = (text) => text.replace(/<[^>]*>/g, '').trim();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const reviews = useSelector((state) => selectProductReviews(state, productId));
  const summary = useSelector((state) => selectReviewSummary(state, productId));
  const loading = useSelector(selectReviewsLoading);

  const [showWriteForm, setShowWriteForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(fetchProductReviews(productId));
    dispatch(fetchReviewSummary(productId));
  }, [dispatch, productId]);

  const validateForm = () => {
    const errors = {};
    if (!rating || rating < 1 || rating > 5) {
      errors.rating = 'Please select a rating from 1 to 5';
    }
    const cleanComment = sanitizeText(comment);
    if (!cleanComment) {
      errors.comment = 'Review comment is required';
    } else if (cleanComment.length < COMMENT_MIN) {
      errors.comment = `Comment must be at least ${COMMENT_MIN} characters`;
    } else if (cleanComment.length > COMMENT_MAX) {
      errors.comment = `Comment must be less than ${COMMENT_MAX} characters`;
    }
    if (title.trim()) {
      const cleanTitle = sanitizeText(title);
      if (cleanTitle.length > TITLE_MAX) {
        errors.title = `Title must be less than ${TITLE_MAX} characters`;
      } else if (!TITLE_PATTERN.test(cleanTitle)) {
        errors.title = 'Title contains invalid characters';
      }
    }
    return errors;
  };

  const isFormValid = rating >= 1 && rating <= 5 && sanitizeText(comment).length >= COMMENT_MIN;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      await dispatch(createReview({
        productId,
        reviewData: {
          rating,
          title: sanitizeText(title),
          comment: sanitizeText(comment),
        }
      })).unwrap();
      toast.success('Review submitted successfully! 🌟');
      setShowWriteForm(false);
      setRating(0);
      setTitle('');
      setComment('');
      setFieldErrors({});
      dispatch(fetchReviewSummary(productId));
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to submit review');
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
                !showWriteForm && (
                <button
                  onClick={() => setShowWriteForm(true)}
                  className="btn-md btn-primary"
                >
                  Write a Review
                </button>
                )
              ) : summary.user_review ? (
                <div style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                  ✓ You reviewed this product
                </div>
              ) : !isAuthenticated ? (
                <button
                  onClick={() => navigate('/login')}
                  className="btn-md btn-secondary"
                >
                  Login to Review
                </button>
              ) : (
                <div style={{ color: '#888', fontSize: '0.9rem' }}>
                  Share your experience with this product
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
          <h4 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 700 }}>Write Your Review</h4>
          <form onSubmit={handleSubmitReview} noValidate>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                Rating <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => { setRating(star); setFieldErrors(prev => ({ ...prev, rating: '' })); }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'transform 0.1s',
                      transform: star <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)',
                    }}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <StarSvg filled={star <= (hoverRating || rating)} size={30} />
                  </button>
                ))}
                {rating > 0 && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
              {fieldErrors.rating && (
                <p style={{ color: '#e53e3e', fontSize: '0.82rem', marginTop: '0.3rem' }}>{fieldErrors.rating}</p>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                Title <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setFieldErrors(prev => ({ ...prev, title: '' }));
                }}
                placeholder="Summarize your experience"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `2px solid ${fieldErrors.title ? '#e53e3e' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                maxLength={TITLE_MAX}
                autoComplete="off"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                {fieldErrors.title ? (
                  <p style={{ color: '#e53e3e', fontSize: '0.82rem', margin: 0 }}>{fieldErrors.title}</p>
                ) : <span />}
                <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{title.length}/{TITLE_MAX}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                Your Review <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setFieldErrors(prev => ({ ...prev, comment: '' }));
                }}
                placeholder={`Share your thoughts about this product... (minimum ${COMMENT_MIN} characters)`}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `2px solid ${fieldErrors.comment ? '#e53e3e' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  minHeight: '100px',
                }}
                maxLength={COMMENT_MAX}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                {fieldErrors.comment ? (
                  <p style={{ color: '#e53e3e', fontSize: '0.82rem', margin: 0 }}>{fieldErrors.comment}</p>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                    {comment.trim().length < COMMENT_MIN ? `${COMMENT_MIN - comment.trim().length} more characters needed` : ''}
                  </span>
                )}
                <span style={{ fontSize: '0.8rem', color: comment.length > COMMENT_MAX * 0.9 ? '#e53e3e' : '#aaa' }}>
                  {comment.length}/{COMMENT_MAX}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                type="submit"
                className="btn-md btn-primary"
                disabled={submitting || !isFormValid}
                style={{
                  opacity: (submitting || !isFormValid) ? 0.5 : 1,
                  cursor: (submitting || !isFormValid) ? 'not-allowed' : 'pointer',
                  minWidth: '150px',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                className="btn-md btn-secondary"
                onClick={() => {
                  setShowWriteForm(false);
                  setRating(0);
                  setTitle('');
                  setComment('');
                  setFieldErrors({});
                }}
              >
                Cancel
              </button>
            </div>
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
