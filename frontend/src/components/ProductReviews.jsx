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
    className="review-star-icon"
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const renderStars = (rating, size = 16) => {
  const fullStars = Math.round(rating || 0);
  return (
    <span className="review-stars-inline">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarSvg key={i} filled={i <= fullStars} size={size} />
      ))}
    </span>
  );
};

const formatDate = (dateString) => (
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
);

const ProductReviews = ({ productId }) => {
  const TITLE_MAX = 100;
  const COMMENT_MIN_WORDS = 3;
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

  const getWordCount = (text) => sanitizeText(text).split(/\s+/).filter(Boolean).length;

  const validateForm = () => {
    const errors = {};
    if (!rating || rating < 1 || rating > 5) {
      errors.rating = 'Please select a rating from 1 to 5';
    }

    const cleanComment = sanitizeText(comment);
    const commentWords = getWordCount(cleanComment);
    if (!cleanComment) {
      errors.comment = 'Review comment is required';
    } else if (commentWords < COMMENT_MIN_WORDS) {
      errors.comment = `Comment must be at least ${COMMENT_MIN_WORDS} words`;
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

  const isFormValid =
    rating >= 1 &&
    rating <= 5 &&
    getWordCount(comment) >= COMMENT_MIN_WORDS;

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
      dispatch(fetchProductReviews(productId));
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
    return <div className="reviews-loading-state">Loading reviews...</div>;
  }

  return (
    <div className="product-reviews">
      <h3 className="reviews-title">
        Customer Reviews {summary?.total_reviews > 0 && `(${summary.total_reviews})`}
      </h3>

      {summary && (
        <div className="review-summary-card">
          <div className="review-summary-grid">
            <div className="review-summary-score">
              <div className="review-summary-score-number">{summary.average_rating.toFixed(1)}</div>
              <div className="review-summary-score-stars">{renderStars(summary.average_rating, 18)}</div>
              <div className="review-summary-score-count">
                {summary.total_reviews} {summary.total_reviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="review-breakdown">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.rating_breakdown[star] || 0;
                return (
                  <div key={star} className="review-breakdown-row">
                    <span className="review-breakdown-label">
                      {star}
                      <StarSvg filled size={13} />
                    </span>
                    <progress
                      className="review-breakdown-progress"
                      value={count}
                      max={summary.total_reviews || 1}
                    />
                    <span className="review-breakdown-count">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="review-summary-action">
              {summary.can_review ? (
                !showWriteForm && (
                  <button
                    onClick={() => setShowWriteForm(true)}
                    className="btn-sm btn-primary"
                  >
                    Write a Review
                  </button>
                )
              ) : summary.user_review ? (
                <div className="review-summary-done">✓ You reviewed this product</div>
              ) : !isAuthenticated ? (
                <button
                  onClick={() => navigate('/login')}
                  className="btn-sm btn-secondary"
                >
                  Login to Review
                </button>
              ) : (
                <div className="review-summary-hint">Share your experience with this product</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showWriteForm && (
        <div className="write-review-form">
          <h4 className="write-review-title">Write Your Review</h4>
          <form onSubmit={handleSubmitReview} noValidate>
            <div className="review-field-block">
              <label className="review-field-label">
                Rating <span className="required-mark">*</span>
              </label>
              <div className="review-stars-picker">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => { setRating(star); setFieldErrors((prev) => ({ ...prev, rating: '' })); }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`star-picker-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <StarSvg filled={star <= (hoverRating || rating)} size={30} />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="review-rating-label">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </span>
                )}
              </div>
              {fieldErrors.rating && <p className="review-error-text">{fieldErrors.rating}</p>}
            </div>

            <div className="review-field-block">
              <label className="review-field-label">
                Title <span className="optional-mark">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="Summarize your experience"
                className={`review-input ${fieldErrors.title ? 'has-error' : ''}`}
                maxLength={TITLE_MAX}
                autoComplete="off"
              />
              <div className="review-meta-row">
                {fieldErrors.title ? <p className="review-error-text">{fieldErrors.title}</p> : <span />}
                <span className="review-counter">{title.length}/{TITLE_MAX}</span>
              </div>
            </div>

            <div className="review-field-block">
              <label className="review-field-label">
                Your Review <span className="required-mark">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, comment: '' }));
                }}
                placeholder={`Share your thoughts... (minimum ${COMMENT_MIN_WORDS} words)`}
                rows={4}
                className={`review-textarea ${fieldErrors.comment ? 'has-error' : ''}`}
                maxLength={COMMENT_MAX}
              />
              <div className="review-meta-row">
                {fieldErrors.comment ? (
                  <p className="review-error-text">{fieldErrors.comment}</p>
                ) : (
                  <span className="review-helper-text">
                    {(() => {
                      const words = getWordCount(comment);
                      return words < COMMENT_MIN_WORDS ? `${COMMENT_MIN_WORDS - words} more words needed` : '';
                    })()}
                  </span>
                )}
                <span className="review-counter">{comment.length}/{COMMENT_MAX}</span>
              </div>
            </div>

            <div className="review-form-actions">
              <button
                type="submit"
                className="btn-sm btn-primary"
                disabled={submitting || !isFormValid}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                className="btn-sm btn-secondary"
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
          <div className="reviews-empty-box">
            <div className="reviews-empty-icon">📝</div>
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item review-item-card">
              <div className="review-item-head">
                <div>
                  <div className="review-item-stars">{renderStars(review.rating)}</div>
                  {review.title && <h4 className="review-item-title">{review.title}</h4>}
                </div>
                <div className="review-item-date">{formatDate(review.created_at)}</div>
              </div>

              <p className="review-item-comment">{review.comment}</p>

              <div className="review-item-footer">
                <div className="review-item-author">
                  By {review.user_name || review.user_phone}
                  {review.is_verified_purchase && (
                    <span className="review-item-verified">✓ Verified Purchase</span>
                  )}
                </div>

                <button
                  onClick={() => handleHelpful(review.id)}
                  className={`review-helpful-btn ${review.user_has_voted ? 'voted' : ''}`}
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
