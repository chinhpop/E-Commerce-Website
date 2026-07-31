import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

/**
 * Bọc quanh 1 route để yêu cầu đăng nhập, và tuỳ chọn giới hạn theo role.
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={['seller', 'admin']}>
 *     <SellerDashboard />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const isForbidden = user && allowedRoles && !allowedRoles.includes(user.role);

  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
    } else if (isForbidden) {
      toast.error('Bạn không có quyền truy cập trang này');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    // Chưa đăng nhập -> về trang login, nhớ lại trang muốn vào để redirect sau khi login nếu cần
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isForbidden) {
    // Đã đăng nhập nhưng sai role -> về trang chủ
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;