import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellerDashboard from './pages/SellerDashboard';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute allowedRoles={['seller', 'admin']}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        {/* /cart sẽ được thêm ở Tuần 2 */}
      </Routes>
    </div>
  );
}

export default App;