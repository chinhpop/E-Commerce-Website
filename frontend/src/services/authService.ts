import api from './api';

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data.data; // { user, accessToken, refreshToken }
};

export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data.data;
};

export const logoutUser = async (refreshToken) => {
  const { data } = await api.post('/auth/logout', { refreshToken });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};
