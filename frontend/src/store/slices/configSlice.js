import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { configAPI } from '../../api/config';

// Async thunks
export const fetchConfig = createAsyncThunk(
  'config/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await configAPI.getAllConfig();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch config');
    }
  }
);

// Initial state with fallback defaults
const initialState = {
  settings: {
    tax_rate: 0.08,
    standard_delivery_charge: 40,
    express_delivery_charge: 50,
    free_delivery_threshold: 500,
    site_name: 'Happy Groceries',
    site_currency: '₹',
  },
  sortOptions: [],
  loading: false,
  error: null,
  initialized: false,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload.settings;
        state.sortOptions = action.payload.sort_options;
        state.initialized = true;
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initialized = true; // Still mark as initialized to use defaults
      });
  },
});

// Selectors
export const selectSettings = (state) => state.config.settings;
export const selectSortOptions = (state) => state.config.sortOptions;
export const selectConfigLoading = (state) => state.config.loading;
export const selectConfigInitialized = (state) => state.config.initialized;

// Computed selectors
export const selectTaxRate = (state) => state.config.settings.tax_rate;
export const selectStandardDeliveryCharge = (state) => state.config.settings.standard_delivery_charge;
export const selectExpressDeliveryCharge = (state) => state.config.settings.express_delivery_charge;
export const selectFreeDeliveryThreshold = (state) => state.config.settings.free_delivery_threshold;
export const selectSiteCurrency = (state) => state.config.settings.site_currency;

export default configSlice.reducer;
