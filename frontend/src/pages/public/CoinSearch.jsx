import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, Loader2, Frown } from 'lucide-react';
import { searchCoins } from '../../services/searchService';
import toast from 'react-hot-toast';

const CoinSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [query]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchCoins(searchTerm);
      setResults(data?.data || []);
    } catch (error) {
      toast.error('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '---';
    if (val < 0.01) return `$${val.toFixed(6)}`;
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center py-8 md:py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Search Cryptocurrency
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Find assets by name, symbol, or rank to get detailed insights.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            placeholder="Search Bitcoin, ETH, or 'Cardano'..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute inset-y-2 right-2 px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      <div className="mt-8">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Scanning the market...</p>
            </div>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <Frown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              We couldn't find any coins matching "{query}". Try checking for typos or using a different keyword.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Search Results ({results.length})
              </h2>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {results.map((coin) => (
                <li key={coin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <Link to={`/coins/${coin.id}`} className="block px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center shadow-inner border border-white/20">
                          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                            {coin.symbol?.substring(0, 1).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {coin.name}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5 space-x-2">
                            <span className="uppercase font-medium tracking-wider">{coin.symbol}</span>
                            <span>&bull;</span>
                            <span>Rank #{coin.rank}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-6 hidden sm:block">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(coin.price)}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinSearch;
