import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllProducts } from '../../services/productService';

type ProductQuery = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
};

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params: ProductQuery = {}, { rejectWithValue }) => {
    try {
      const result = await getAllProducts(params);
      return result;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch products');
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

        const payloadData = action.payload?.data ?? {};
        state.items = Array.isArray(payloadData.products) ? payloadData.products : [];
        state.pagination = {
          page: payloadData.pagination?.page ?? 1,
          limit: payloadData.pagination?.limit ?? 10,
          total: payloadData.pagination?.total ?? 0,
          totalPages: payloadData.pagination?.totalPages ?? 1,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
