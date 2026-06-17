import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, LineChart, Activity, Wallet, Search, SlidersHorizontal, Shield, X } from 'lucide-react';
import { ROLES } from '../../utils/constants';
import { setSidebarOpen } from '../../store/slices/uiSlice';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [ROLES.USER, ROLES.ADMIN] },
  { name: 'Market Overview', path: '/market', icon: LineChart, roles: [ROLES.USER, ROLES.ADMIN] },
  { name: 'Analytics', path: '/analytics', icon: Activity, roles: [ROLES.USER, ROLES.ADMIN] },
  { name: 'Portfolio', path: '/portfolio', icon: Wallet, roles: [ROLES.USER, ROLES.ADMIN] },
  { name: 'Coin Search', path: '/search', icon: Search, roles: [ROLES.USER, ROLES.ADMIN] },
  { name: 'Screener', path: '/screener', icon: SlidersHorizontal, roles: [ROLES.USER, ROLES.ADMIN] },
];

const adminItems = [
  { name: 'Admin Dashboard', path: '/admin', icon: Shield, roles: [ROLES.ADMIN] },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  const renderLinks = (items) => {
    return items
      .filter((item) => item.roles.includes(user?.role))
      .map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => dispatch(setSidebarOpen(false))}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <Icon
              className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
              aria-hidden="true"
            />
            <span className="truncate">{item.name}</span>
          </NavLink>
        );
      });
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden transition-opacity"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between flex-shrink-0 px-4 mb-5">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Activity className="h-6 w-6" />
              CryptoDash
            </h1>
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              onClick={() => dispatch(setSidebarOpen(false))}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-5 flex-1 px-3 space-y-1">
            <div className="mb-4">
              <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Main
              </p>
              {renderLinks(navItems)}
            </div>

            {user?.role === ROLES.ADMIN && (
              <div className="mt-8">
                <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Administration
                </p>
                {renderLinks(adminItems)}
              </div>
            )}
          </nav>
        </div>
        
        {/* Bottom branding or extra links could go here */}
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-center w-full text-gray-500 dark:text-gray-400">
            &copy; 2026 CryptoAnalytics
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
