import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../../services/cartService';

export type CartItem = {
  _id: string;
  product?: {
    _id?: string;
    name?: string;
    price?: number;
    stock?: number;
    images?: string[];
  };
  quantity: number;
  subtotal: number;
};

export type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
};

type AddToCartPayload = {
  productId: string;
  quantity?: number;
};

type UpdateQuantityPayload = {
  productId: string;
  quantity: number;
};

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    return await getCart();
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || 'Không tải được giỏ hàng');
  }
});

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }: AddToCartPayload, { rejectWithValue }) => {
    try {
      return await addToCart(productId, quantity);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Thêm vào giỏ hàng thất bại');
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateItem',
  async ({ productId, quantity }: UpdateQuantityPayload, { rejectWithValue }) => {
    try {
      return await updateCartItem(productId, quantity);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Cập nhật số lượng thất bại');
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      return await removeCartItem(productId);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Xóa sản phẩm thất bại');
    }
  }
);

export const clearCartItems = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    return await clearCart();
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || 'Xóa giỏ hàng thất bại');
  }
});

const isCartAction = (suffix: string) => (action: { type: string }) =>
  action.type.startsWith('cart/') && action.type.endsWith(suffix);

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === 'string') return payload;
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return fallback;
};

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
      .addMatcher(isCartAction('/fulfilled'), (state, action: { payload?: unknown }) => {
        state.loading = false;
        const payload = action.payload as { items?: CartItem[]; totalItems?: number; totalPrice?: number } | undefined;
        state.items = payload?.items ?? [];
        state.totalItems = payload?.totalItems ?? 0;
        state.totalPrice = payload?.totalPrice ?? 0;
      })
      .addMatcher(isCartAction('/rejected'), (state, action: { payload?: unknown }) => {
        state.loading = false;
        state.error = getErrorMessage(action.payload, 'Cart action failed');
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;