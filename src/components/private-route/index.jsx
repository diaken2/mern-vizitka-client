import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth-context';

const roleRedirectMap = {
  admin: '/admin',
  full: '/table',
  limited: '/table',
  viewer: '/table',
};

const PrivateRoute = ({ element, allowedRoles }) => {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token || !user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!allowedRoles.includes(user.role)) return <Navigate to={roleRedirectMap[user.role] || '/login'} replace />;

  return element;
};

export default PrivateRoute;