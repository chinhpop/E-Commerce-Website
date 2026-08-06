import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { getProductById } from '../services/productService';
import { addItemToCart } from '../store/slices/cartSlice';

const FALLBACK_IMAGE = 'https://placehold.co/600x600?text=No+Image';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không tải được sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    setAdding(true);
    const result = await dispatch(addItemToCart({ productId: product._id, quantity: 1 }));

    if (addItemToCart.fulfilled.match(result)) {
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
    } else {
      // result.payload là message lỗi từ backend, vd: "Chỉ còn 5 sản phẩm... trong kho"
      toast.error(result.payload || 'Thêm vào giỏ hàng thất bại');
    }
    setAdding(false);
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Đang tải...</div>;
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error || 'Sản phẩm không tồn tại'}</p>
        <Link to="/" className="text-indigo-600 hover:underline">
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const image = product.images?.[0] || FALLBACK_IMAGE;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow-sm p-6">
        <img src={image} alt={product.name} className="w-full h-96 object-cover rounded-lg" />

        <div className="flex flex-col">
          <span className="text-sm text-indigo-600 font-medium mb-2">{product.category}</span>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>

          <p className="text-3xl font-bold text-gray-900 mb-2">${product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-6">
            {product.stock > 0 ? `Còn ${product.stock} sản phẩm trong kho` : 'Hết hàng'}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="mt-auto bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-40"
          >
            {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;