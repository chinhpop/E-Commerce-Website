import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../store/store';
import {
  fetchCart,
  updateItemQuantity,
  removeItemFromCart,
  type CartItem,
  type CartState,
} from '../store/slices/cartSlice';

const FALLBACK_IMAGE = 'https://placehold.co/120x120?text=No+Image';

const EmptyCart = () => (
  <div className="max-w-md mx-auto px-4 py-20 text-center">
    <div className="text-7xl mb-6">🛒</div>
    <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
    <p className="text-gray-500 mb-6">Hãy khám phá và thêm những sản phẩm bạn thích nhé.</p>
    <Link
      to="/"
      className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
    >
      Tiếp tục mua sắm
    </Link>
  </div>
);

const CartPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, totalItems, totalPrice, loading } = useSelector((state: RootState) => state.cart) as CartState;

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Backend nhận diện item qua product._id (route /api/cart/:productId), không phải item._id
  const handleQuantityChange = async (productId?: string, currentQty = 0, delta = 0, stock?: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return; // dùng nút xóa thay vì cho về 0
    if (stock !== undefined && newQty > stock) {
      toast.error(`Chỉ còn ${stock} sản phẩm trong kho`);
      return;
    }

    const safeProductId = productId ?? '';
    const result = await dispatch(updateItemQuantity({ productId: safeProductId, quantity: newQty }));
    if (!updateItemQuantity.fulfilled.match(result)) {
      toast.error(typeof result.payload === 'string' ? result.payload : 'Cập nhật số lượng thất bại');
    }
  };

  const handleRemove = async (productId?: string, name?: string) => {
    const result = await dispatch(removeItemFromCart(productId ?? ''));
    if (removeItemFromCart.fulfilled.match(result)) {
      toast.success(`Đã xóa "${name ?? 'sản phẩm'}" khỏi giỏ hàng`);
    } else {
      toast.error(typeof result.payload === 'string' ? result.payload : 'Xóa sản phẩm thất bại');
    }
  };

  const handleCheckout = () => {
    toast('Chức năng thanh toán đang được phát triển', { icon: '🚧' });
  };

  if (loading && items.length === 0) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Đang tải giỏ hàng...</div>;
  }

  if (!loading && items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn ({totalItems} sản phẩm)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const { _id, product, quantity, subtotal } = item;
            const productId = product?._id;
            const stock = product?.stock;

            return (
              <div key={_id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-center">
                <img
                  src={product?.images?.[0] || FALLBACK_IMAGE}
                  alt={product?.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${productId}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition line-clamp-1"
                  >
                    {product?.name}
                  </Link>
                  <p className="text-sm text-gray-500">${(product?.price ?? 0).toFixed(2)} / sản phẩm</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleQuantityChange(productId, quantity, -1, stock)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-50 transition"
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(productId, quantity, 1, stock)}
                      disabled={stock !== undefined && quantity >= stock}
                      className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-40"
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                    {stock !== undefined && quantity >= stock && (
                      <span className="text-xs text-amber-600 ml-1">Đã đạt tồn kho tối đa</span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 mb-2">${subtotal.toFixed(2)}</p>
                  <button
                    onClick={() => handleRemove(productId, product?.name)}
                    className="text-sm text-red-500 hover:text-red-700 transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 h-fit lg:sticky lg:top-20">
          <h2 className="font-semibold text-lg mb-4">Tổng đơn hàng</h2>

          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Số lượng sản phẩm</span>
            <span>{totalItems}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
            <span>Tổng tiền</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Tiến hành thanh toán
          </button>

          <Link
            to="/"
            className="block text-center text-sm text-gray-500 hover:text-indigo-600 mt-3 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;