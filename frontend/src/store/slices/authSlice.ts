import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerUser, loginUser, logoutUser } from '../../services/authService';

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    const parsed = JSON.parse(storedUser);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  loading: false,
  error: null as string | null,
};

const persistAuth = ({ user, accessToken, refreshToken }: { user: unknown; accessToken: string; refreshToken: string }) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearAuthStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const register = createAsyncThunk('auth/register', async (payload: Record<string, unknown>, { rejectWithValue }) => {
  try {
    const result = await registerUser(payload);
    if (result) {
      persistAuth(result);
    }
    return result;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || 'Register failed');
  }
});

export const login = createAsyncThunk('auth/login', async (payload: Record<string, unknown>, { rejectWithValue }) => {
  try {
    const result = await loginUser(payload);
    if (result) {
      persistAuth(result);
    }
    return result;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const { refreshToken } = (getState() as { auth: { refreshToken: string | null } }).auth;
  try {
    await logoutUser(refreshToken);
  } catch {
    // Ngay cả khi API lỗi, vẫn clear phía client
  }
  clearAuthStorage();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user ?? null;
        state.accessToken = action.payload?.accessToken ?? null;
        state.refreshToken = action.payload?.refreshToken ?? null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Register failed';
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user ?? null;
        state.accessToken = action.payload?.accessToken ?? null;
        state.refreshToken = action.payload?.refreshToken ?? null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
