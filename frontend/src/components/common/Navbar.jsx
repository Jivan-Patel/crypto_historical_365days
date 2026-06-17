import { Menu, Search } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex-shrink-0 flex h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 shadow-sm transition-colors duration-500">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex items-center md:hidden">
          <button
            type="button"
            className="p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => dispatch(setSidebarOpen(true))}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center md:justify-start px-2 lg:ml-6">
          <div className="max-w-lg w-full lg:max-w-xs flex items-center">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700/50 rounded-full leading-5 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-300 hover:shadow-md focus:shadow-lg focus:bg-white dark:focus:bg-slate-800 backdrop-blur-sm"
                placeholder="Search assets..."
              />
            </form>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-2">
          <div className="p-1 rounded-full bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-1 shadow-inner">
            <ThemeToggle />
          </div>
          <div className="pl-2 border-l border-slate-200 dark:border-slate-700">
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
