import api from './api';

export const getCart = async () => {
    const { data } = await api.get('/cart');
    return data.data; // { success, data: [...], total }
};

export const addToCart = async (productId, quantity) => {
    const { data } = await api.post('/cart', { productId, quantity });
    return data.data;
};

export const updateCartItem = async (cartItemId, quantity) => {
    const { data } = await api.put(`/cart/${cartItemId}`, { quantity });
    return data.data;
};

export const removeCartItem = async (cartItemId) => {
    const { data } = await api.delete(`/cart/${cartItemId}`);
    return data.data;
};

export const clearCart = async () => {
    const { data } = await api.delete('/cart/clear');
    return data.data;
};