import LoginPage from '../pages/login';
import TablePage from '../pages/data-entry';
import AdminPage from '../pages/admin-panel';
import HomePage from '../components/hero/Hero.jsx';
import AdminLogin from '../pages/admin-auth/index.jsx';
import AdminAuthPagePanel from '../pages/admin-auth-page-panel/index.jsx';
import Home from '../components/Home.jsx';

export const publicRoutes = [
  { path: '/', element: <Home/> },
  { path: '/login', element: <LoginPage /> },
];

export const roleBasedRoutes = {
  admin: [
    { path: '/admin', element: <AdminPage /> },
    { path: '/table', element: <TablePage /> },
    {path:'/admin-auth', element: <AdminAuthPagePanel/>}
  ],
  full: [
    { path: '/table', element: <TablePage /> },
  ],
  limited: [
    { path: '/table', element: <TablePage /> },
  ],
  viewer: [
    { path: '/table', element: <TablePage /> },
  ],
};