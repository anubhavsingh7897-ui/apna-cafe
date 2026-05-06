import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ auth, allowedRoles }) {
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
