import { Routes, Route, Navigate } from 'react-router-dom';
import { publicRoutes, roleBasedRoutes } from '../../routes';
import PrivateRoute from '../private-route';
import { useAuth } from '../auth-context';

const RouterComponent = () => {
  const { user, isLoading } = useAuth();
  const role = user?.role;

  const defaultRolePath = {
    admin: '/admin',
    full: '/table',
    limited: '/table',
    viewer: '/table',
  }[role] || '/';

  if (isLoading) return null; // или спиннер

  return (
    <Routes>
      {publicRoutes.map((route, i) => <Route key={i} {...route} />)}
      {role && roleBasedRoutes[role]?.map((route, i) => (
        <Route
          key={i}
          path={route.path}
          element={<PrivateRoute element={route.element} allowedRoles={[role]} />}
        />
      ))}
      <Route path="*" element={<Navigate to={defaultRolePath} replace />} />
    </Routes>
  );
};

export default RouterComponent;
