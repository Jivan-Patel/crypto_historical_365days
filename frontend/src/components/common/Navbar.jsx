import { Menu } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';

const Navbar = () => {
  const dispatch = useDispatch();

  return (
    <header className="sticky top-0 z-30 flex-shrink-0 flex h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex items-center md:hidden">
          <button
            type="button"
            className="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-md"
            onClick={() => dispatch(setSidebarOpen(true))}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="flex-1 flex justify-center md:justify-start px-2 lg:ml-6">
          <div className="max-w-lg w-full lg:max-w-xs flex items-center">
            {/* Optional Global Search Input could go here */}
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <ThemeToggle />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
