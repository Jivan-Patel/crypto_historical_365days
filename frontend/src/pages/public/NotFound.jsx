import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-indigo-600 dark:text-indigo-500">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          Page not found
        </h2>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center px-5 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="mr-2 h-5 w-5" />
            Search Coins
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
