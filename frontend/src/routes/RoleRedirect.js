import { Navigate } from 'react-router-dom';

const homeByRole = {
  admin: '/admin/overview',
  waiter: '/waiter/dashboard',
  cashier: '/cashier/dashboard',
  kitchen: '/kitchen/dashboard'
};

export default function RoleRedirect({ auth }) {
  return <Navigate to={homeByRole[auth.user.role] || '/login'} replace />;
}
