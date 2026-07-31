import api from './api';

export const getAllProducts = async ({ page = 1, limit = 10, category, search } = {}) => {
  const { data } = await api.get('/products', { params: { page, limit, category, search } });
  return data; // { success, data: [...], pagination }
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.data.product;
};

export const createProduct = async (payload) => {
  const { data } = await api.post('/products', payload);
  return data.data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data.data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
