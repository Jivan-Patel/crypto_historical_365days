import { useState, useEffect } from 'react';
import { Filter, Loader2, ArrowRight } from 'lucide-react';
import { FILTER_FN_MAP } from '../../services/filterService';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const FILTER_OPTIONS = [
  { id: 'high-price', label: 'High Price (> $1000)', description: 'Premium assets trading above $1,000' },
  { id: 'low-price', label: 'Low Price (< $1)', description: 'Penny assets trading below $1' },
  { id: 'high-volume', label: 'High Volume', description: 'Highly liquid assets with high 24h trading volume' },
  { id: 'high-market-cap', label: 'Large Cap', description: 'Established assets with high market capitalization' },
  { id: 'low-market-cap', label: 'Small Cap', description: 'Emerging assets with lower market cap' },
  { id: 'high-volatility', label: 'High Volatility', description: 'Assets with large price swings' },
  { id: 'bullish', label: 'Bullish Trend', description: 'Assets showing strong upward momentum' },
  { id: 'bearish', label: 'Bearish Trend', description: 'Assets currently in a downtrend' },
  { id: 'high-return', label: 'Top Gainers', description: 'Assets with the highest recent returns' },
];

const Screener = () => {
  const [activeFilter, setActiveFilter] = useState('high-volume');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    applyFilter(activeFilter);
  }, [activeFilter]);

  const applyFilter = async (filterId) => {
    setLoading(true);
    try {
      const filterFn = FILTER_FN_MAP[filterId];
      if (filterFn) {
        const response = await filterFn({ limit: 50 });
        setResults(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to apply filter. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '---';
    if (val < 0.01) return `$${val.toFixed(6)}`;
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="md:w-1/3 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Filter className="w-6 h-6 mr-2 text-indigo-500" />
              Coin Screener
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Filter the market using pre-configured advanced strategies.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Strategy Presets</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveFilter(option.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    activeFilter === option.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent'
                  }`}
                >
                  <div className={`font-semibold ${activeFilter === option.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:w-2/3 flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm min-h-[600px] flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {FILTER_OPTIONS.find(o => o.id === activeFilter)?.label} Results
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {results.length} assets found
              </span>
            </div>
            
            <div className="flex-1 p-0 relative">
              {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
              )}
              
              {!loading && results.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 py-12">
                  No assets currently match this criteria.
                </div>
              )}

              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.map((coin, idx) => (
                  <li key={coin.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <Link to={`/coins/${coin.id || coin._id}`} className="flex items-center justify-between p-4 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center shadow-inner border border-white/20">
                          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                            {coin.symbol?.substring(0, 1).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {coin.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mt-0.5">
                            {coin.symbol}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(coin.price)}
                          </div>
                          <div className={`text-xs mt-0.5 font-medium ${coin.percentage_change_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {coin.percentage_change_24h >= 0 ? '+' : ''}
                            {coin.percentage_change_24h?.toFixed(2)}%
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 hidden sm:block" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screener;
