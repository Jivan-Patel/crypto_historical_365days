import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import Dashboard from '../pages/public/Dashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import { ROLES } from '../utils/constants';

import NotFound from '../pages/public/NotFound';
import MarketOverview from '../pages/public/MarketOverview';
import CoinDetail from '../pages/public/CoinDetail';
import Portfolio from '../pages/public/Portfolio';
import CoinSearch from '../pages/public/CoinSearch';
import Screener from '../pages/public/Screener';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public/Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* User Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/market" element={<MarketOverview />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/coins/:id" element={<CoinDetail />} />
          <Route path="/search" element={<CoinSearch />} />
          <Route path="/screener" element={<Screener />} />
          {/* Admin Routes */}
          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
