import api from './api';

export const registerUser = async (payload: Record<string, unknown>) => {
  const { data } = await api.post('/auth/register', payload);
  return data?.data ?? null;
};

export const loginUser = async (payload: Record<string, unknown>) => {
  const { data } = await api.post('/auth/login', payload);
  return data?.data ?? null;
};

export const logoutUser = async (refreshToken: string | null) => {
  const { data } = await api.post('/auth/logout', { refreshToken });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data?.data?.user ?? null;
};
