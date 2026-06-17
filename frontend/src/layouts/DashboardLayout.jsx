import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between h-16">
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">CryptoAnalytics</h2>
        </div>
        <nav className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sidebar placeholder</p>
        </nav>
      </aside>
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 justify-between shrink-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">Header placeholder</p>
        </header>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
