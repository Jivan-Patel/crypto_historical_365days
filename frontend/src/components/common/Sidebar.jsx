import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, LineChart, Activity, Wallet, Search, SlidersHorizontal, Shield, X } from 'lucide-react';
import { ROLES } from '../../utils/constants';
import { setSidebarOpen } from '../../store/slices/uiSlice';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [ROLES.USER, ROLES.ADMIN] },
  { name: 'Market Overview', path: '/market', icon: LineChart, roles: [ROLES.USER, ROLES.ADMIN] },
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
              `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 text-indigo-700 dark:text-indigo-400 shadow-sm relative overflow-hidden'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-md" />
                )}
                <Icon
                  className={`flex-shrink-0 mr-3 h-5 w-5 transition-colors duration-300 ${
                    isActive 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </>
            )}
          </NavLink>
        );
      });
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-white/20 dark:border-slate-800/50 flex flex-col transition-transform duration-300 ease-out md:translate-x-0 md:static md:inset-auto shadow-xl md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between flex-shrink-0 px-6 mb-8">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <Activity className="h-5 w-5" />
              </div>
              CryptoAnalytics
            </h1>
            <button
              className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full"
              onClick={() => dispatch(setSidebarOpen(false))}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="mt-2 flex-1 px-4 space-y-2">
            <div className="mb-6">
              <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                Main Menu
              </p>
              <div className="space-y-1">
                {renderLinks(navItems)}
              </div>
            </div>

            {user?.role === ROLES.ADMIN && (
              <div className="mt-8">
                <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                  Administration
                </p>
                <div className="space-y-1">
                  {renderLinks(adminItems)}
                </div>
              </div>
            )}
          </nav>
        </div>
        
        {/* Bottom branding or extra links could go here */}
        <div className="flex-shrink-0 flex border-t border-slate-200/50 dark:border-slate-800/50 p-4 m-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 backdrop-blur-sm">
          <div className="flex items-center w-full">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                Pro Plan
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Upgrade for more features
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
