import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">CryptoAnalytics</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
