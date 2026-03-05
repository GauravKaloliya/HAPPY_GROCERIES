import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsAPI } from '../../api/reviews';

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.getProductReviews(productId);
      return { productId, reviews: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch reviews');
    }
  }
);

export const fetchReviewSummary = createAsyncThunk(
  'reviews/fetchReviewSummary',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.getReviewSummary(productId);
      return { productId, summary: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch review summary');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.createReview(productId, reviewData);
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      if (data?.error) return rejectWithValue(data.error);
      if (data?.detail) return rejectWithValue(data.detail);
      if (typeof data === 'object') {
        const firstMsg = Object.values(data).flat()[0];
        if (firstMsg) return rejectWithValue(String(firstMsg));
      }
      return rejectWithValue('Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.updateReview(reviewId, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewsAPI.deleteReview(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete review');
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  'reviews/markReviewHelpful',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.markHelpful(reviewId);
      return { reviewId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark review helpful');
    }
  }
);

export const fetchMyReviews = createAsyncThunk(
  'reviews/fetchMyReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.getMyReviews();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch your reviews');
    }
  }
);

export const fetchPendingReviews = createAsyncThunk(
  'reviews/fetchPendingReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.getPendingReviews();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch pending reviews');
    }
  }
);

const initialState = {
  // Keyed by productId
  productReviews: {},
  reviewSummaries: {},
  myReviews: [],
  pendingReviews: [],
  loading: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        const reviewsData = action.payload.reviews;
        const reviews = reviewsData?.results || reviewsData;
        state.productReviews[action.payload.productId] = Array.isArray(reviews) ? reviews : [];
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch review summary
      .addCase(fetchReviewSummary.fulfilled, (state, action) => {
        state.reviewSummaries[action.payload.productId] = action.payload.summary;
      })

      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        const productId = typeof action.payload.product === 'object'
          ? action.payload.product?.id
          : action.payload.product;
        if (!productId) {
          return;
        }
        if (!state.productReviews[productId]) {
          state.productReviews[productId] = [];
        }
        state.productReviews[productId].unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update review
      .addCase(updateReview.fulfilled, (state, action) => {
        const productId = typeof action.payload.product === 'object'
          ? action.payload.product?.id
          : action.payload.product;
        if (state.productReviews[productId]) {
          const index = state.productReviews[productId].findIndex(
            r => r.id === action.payload.id
          );
          if (index !== -1) {
            state.productReviews[productId][index] = action.payload;
          }
        }
        // Update in myReviews too
        const myIndex = state.myReviews.findIndex(r => r.id === action.payload.id);
        if (myIndex !== -1) {
          state.myReviews[myIndex] = action.payload;
        }
      })

      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        // Remove from all product reviews
        Object.keys(state.productReviews).forEach(productId => {
          state.productReviews[productId] = state.productReviews[productId].filter(
            r => r.id !== action.payload
          );
        });
        // Remove from myReviews
        state.myReviews = state.myReviews.filter(r => r.id !== action.payload);
      })

      // Mark helpful
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const { reviewId } = action.payload;
        Object.keys(state.productReviews).forEach(productId => {
          const review = state.productReviews[productId].find(r => r.id === reviewId);
          if (review) {
            review.helpful_count = action.payload.helpful_count;
            review.user_has_voted = !review.user_has_voted;
          }
        });
      })

      // Fetch my reviews
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.myReviews = action.payload;
      })

      // Fetch pending reviews
      .addCase(fetchPendingReviews.fulfilled, (state, action) => {
        state.pendingReviews = action.payload;
      });
  },
});

// Selectors
export const selectProductReviews = (state, productId) =>
  state.reviews.productReviews[productId] || [];
export const selectReviewSummary = (state, productId) =>
  state.reviews.reviewSummaries[productId] || null;
export const selectMyReviews = (state) => state.reviews.myReviews;
export const selectPendingReviews = (state) => state.reviews.pendingReviews;
export const selectReviewsLoading = (state) => state.reviews.loading;
export const selectReviewsError = (state) => state.reviews.error;

export const { clearReviewError } = reviewsSlice.actions;
export default reviewsSlice.reducer;
