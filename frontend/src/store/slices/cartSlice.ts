import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../../services/cartService';

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    return await getCart();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Không tải được giỏ hàng');
  }
});

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      return await addToCart(productId, quantity);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Thêm vào giỏ hàng thất bại');
    }
  }
);

// Backend nhận diện item qua product._id (route PUT /api/cart/:productId), KHÔNG phải
// _id của item trong mảng cart.items. Đặt tên tham số là productId cho đúng thực tế.
export const updateItemQuantity = createAsyncThunk(
  'cart/updateItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      return await updateCartItem(productId, quantity);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Cập nhật số lượng thất bại');
    }
  }
);

// Tương tự, backend xóa theo product._id (route DELETE /api/cart/:productId)
export const removeItemFromCart = createAsyncThunk(
  'cart/removeItem',
  async (productId, { rejectWithValue }) => {
    try {
      return await removeCartItem(productId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Xóa sản phẩm thất bại');
    }
  }
);

export const clearCartItems = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    return await clearCart();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Xóa giỏ hàng thất bại');
  }
});

// Cả 5 thunk trên đều trả về CÙNG shape từ backend: { cartId, items, totalItems, totalPrice }
// (object, không phải mảng phẳng) -> đọc trực tiếp field, không cần tự tính lại.
const isCartAction = (suffix) => (action) =>
  action.type.startsWith('cart/') && action.type.endsWith(suffix);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isCartAction('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isCartAction('/fulfilled'), (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.items = payload.items ?? [];
        state.totalItems = payload.totalItems ?? 0;
        state.totalPrice = payload.totalPrice ?? 0;
      })
      .addMatcher(isCartAction('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;