import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllProducts } from '../../services/productService';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const result = await getAllProducts(params);
      return result; // { data, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

const initialState = {
  items: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;

        state.pagination = {
          page: action.payload.page,
          limit: 10,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
    };
})
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
