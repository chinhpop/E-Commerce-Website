import api from './api';

export const getAllProducts = async ({ page = 1, limit = 10, category, search }: { page?: number; limit?: number; category?: string; search?: string } = {}) => {
  const { data } = await api.get('/products', { params: { page, limit, category, search } });
  return data;
};

export const getMyProducts = async ({ page = 1, limit = 100 } = {}) => {
  const { data } = await api.get('/products/my-products', { params: { page, limit } });
  return data?.data ?? { products: [], pagination: null };
};

export const getProductById = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data?.data?.product ?? null;
};

export const createProduct = async (payload: Record<string, unknown>) => {
  const { data } = await api.post('/products', payload);
  return data?.data ?? null;
};

export const updateProduct = async (id: string, payload: Record<string, unknown>) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data?.data ?? null;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};