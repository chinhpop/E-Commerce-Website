import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductGrid from '../components/Product/ProductGrid';

const HomePage = () => {
  const dispatch = useDispatch();
  const { items, pagination, loading } = useSelector((state) => state.products);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts({ page, limit: 8 }));
  }, [dispatch, page]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sản phẩm nổi bật</h1>

      <ProductGrid products={items} loading={loading} />

      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white border shadow-sm disabled:opacity-40 hover:bg-gray-50"
          >
            ← Trước
          </button>
          <span className="text-sm text-gray-600">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 rounded-lg bg-white border shadow-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
