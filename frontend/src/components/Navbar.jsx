import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600"
        >
          ShopEasy
        </Link>

        {/* Menu bên phải */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <button
            className="rounded-full p-2 transition hover:bg-gray-100"
            aria-label="Cart"
          >
            🛒
          </button>

          {/* Login */}
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;