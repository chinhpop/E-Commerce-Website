import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../services/api";
import { logout } from "../store/slices/authSlice";
import { fetchCart, resetCart } from "../store/slices/cartSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Tải giỏ hàng ngay khi có user đăng nhập (để badge hiện đúng số lượng
  // kể cả khi user F5 lại trang hoặc mới login xong)
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await api.post("/auth/logout", { refreshToken });
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(logout());
      dispatch(resetCart());
      localStorage.clear();
      toast.success("Đăng xuất thành công!");
      navigate("/login");
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">

        <Link
          to="/"
          className="text-2xl font-bold text-blue-600"
        >
          E-Commerce
        </Link>

        <div className="flex items-center gap-5">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Trang chủ
          </Link>

          {(user?.role === "seller" || user?.role === "admin") && (
            <Link
              to="/seller/products"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Sản phẩm của tôi
            </Link>
          )}

          {user && (
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-blue-600 transition"
              aria-label="Giỏ hàng"
            >
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <>
              <span className="font-medium">
                Xin chào, {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-blue-600 transition"
              >
                Đăng nhập
              </Link>

              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;