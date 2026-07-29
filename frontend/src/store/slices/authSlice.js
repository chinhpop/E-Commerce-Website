import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerUser, loginUser, logoutUser } from '../../services/authService';

const storedUser = localStorage.getItem("user");

let parsedUser = null;

try {
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch (error) {
  localStorage.removeItem("user");
  parsedUser = null;
}

const initialState = {
  user: parsedUser,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  loading: false,
  error: null,
};

const persistAuth = ({ user, accessToken, refreshToken }) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearAuthStorage = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const result = await registerUser(payload);
    persistAuth(result);
    return result;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Register failed');
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const result = await loginUser(payload);
    persistAuth(result);
    return result;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const { refreshToken } = getState().auth;
  try {
    await logoutUser(refreshToken);
  } catch (err) {
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
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
