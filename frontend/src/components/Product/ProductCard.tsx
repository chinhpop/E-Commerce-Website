import { Link } from 'react-router-dom';

const FALLBACK_IMAGE = 'https://placehold.co/400x400?text=No+Image';

const ProductCard = ({ product }) => {
  const image = product.images?.[0] || FALLBACK_IMAGE;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <img src={image} alt={product.name} className="w-full h-48 object-cover" />

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-indigo-600 font-medium mb-1">{product.category}</span>
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
        <p className="text-lg font-bold text-gray-900 mt-auto">${product.price.toFixed(2)}</p>

        <Link
          to={`/products/${product._id}`}
          className="mt-3 text-center bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
