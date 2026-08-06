import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PRODUCT_CATEGORIES } from '../constants/categories';
import { getMyProducts, createProduct, deleteProduct } from '../services/productService';
import EditProductModal from '../components/Product/EditProductModal';

type ProductFormState = {
  name: string;
  description: string;
  category: string;
  price: string | number;
  stock: string | number;
  imageUrl: string;
};

type SellerProduct = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images?: string[];
};

const EMPTY_FORM: ProductFormState = {
  name: '',
  description: '',
  category: PRODUCT_CATEGORIES[0],
  price: '',
  stock: '',
  imageUrl: '',
};

const SellerDashboard = () => {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<ProductFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Lấy danh sách sản phẩm của chính seller đang đăng nhập (GET /api/products/my-products)
  const loadOwnProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMyProducts({ page: 1, limit: 100 });
      setProducts(result.products);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tải được danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwnProducts();
  }, [loadOwnProducts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm không được để trống';
    if (!formData.description.trim()) newErrors.description = 'Mô tả không được để trống';
    if (formData.price === '' || Number(formData.price) < 0) newErrors.price = 'Giá không hợp lệ';
    if (formData.stock === '' || Number(formData.stock) < 0) newErrors.stock = 'Tồn kho không hợp lệ';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createProduct({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        images: formData.imageUrl ? [formData.imageUrl] : [],
      });
      toast.success('Thêm sản phẩm thành công');
      setFormData(EMPTY_FORM);
      loadOwnProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thêm sản phẩm thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: SellerProduct) => {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    setDeletingId(product._id);
    try {
      await deleteProduct(product._id);
      toast.success('Đã xóa sản phẩm');
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdated = (updatedProduct: SellerProduct) => {
    setProducts((prev) => prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p)));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý sản phẩm của tôi</h1>

      {/* Form thêm sản phẩm mới */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Thêm sản phẩm mới</h2>

        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Wireless Mouse"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Danh mục</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả ngắn gọn về sản phẩm..."
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Giá ($)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tồn kho</label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL ảnh (tạm)</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Chưa hỗ trợ upload ảnh thật — dán URL ảnh tạm thời. Upload lên S3 sẽ làm ở Tuần 3.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {submitting ? 'Đang thêm...' : '+ Thêm sản phẩm'}
          </button>
        </form>
      </div>

      {/* Bảng danh sách sản phẩm của seller */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold p-6 pb-0">Sản phẩm của tôi ({products.length})</h2>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Đang tải...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            Bạn chưa có sản phẩm nào. Thêm sản phẩm đầu tiên ở form phía trên.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="p-4 font-medium">Ảnh</th>
                  <th className="p-4 font-medium">Tên sản phẩm</th>
                  <th className="p-4 font-medium">Danh mục</th>
                  <th className="p-4 font-medium">Giá</th>
                  <th className="p-4 font-medium">Tồn kho</th>
                  <th className="p-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <img
                        src={product.images?.[0] || 'https://placehold.co/64x64?text=No+Img'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </td>
                    <td className="p-4 font-medium text-gray-900">{product.name}</td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4 text-gray-900">${product.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span
                        className={product.stock === 0 ? 'text-red-500' : 'text-gray-600'}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product._id}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition disabled:opacity-50"
                        >
                          {deletingId === product._id ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
};

export default SellerDashboard;