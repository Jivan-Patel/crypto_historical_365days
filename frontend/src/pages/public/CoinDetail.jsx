import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Globe, Github, Info, Loader2, Star } from 'lucide-react';
import { getCoinById } from '../../services/coinService';
import toast from 'react-hot-toast';
import HistoricalChart from '../../features/coins/components/HistoricalChart';

const CoinDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoinDetails = async () => {
      try {
        setLoading(true);
        const data = await getCoinById(id);
        if (data) {
          setCoin(data);
        } else {
          toast.error('Coin not found');
          navigate('/market');
        }
      } catch (error) {
        toast.error('Failed to load coin details');
        navigate('/market');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCoinDetails();
    }
  }, [id, navigate]);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '---';
    if (val < 0.01) return `$${val.toFixed(6)}`;
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatLargeNumber = (val) => {
    if (val === undefined || val === null) return '---';
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const renderPercentage = (val) => {
    if (val === undefined || val === null) return <span className="text-gray-500">---</span>;
    const isPositive = val >= 0;
    return (
      <span className={`font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'} flex items-center`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
        {Math.abs(val).toFixed(2)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!coin) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Back Button */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Market
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white dark:border-gray-800">
              {coin.symbol?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {coin.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-sm font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 uppercase">
                  {coin.symbol}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                  Rank #{coin.rank}
                </span>
              </div>
              <div className="flex items-center mt-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                <button className="flex items-center hover:text-yellow-500 transition-colors">
                  <Star className="w-4 h-4 mr-1" /> Add to Watchlist
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end">
            <div className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {formatCurrency(coin.price)}
            </div>
            <div className="mt-1 text-lg">
              {renderPercentage(coin.percentage_change_24h)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col min-h-[450px]">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Price Trend</h2>
            <div className="flex-1">
              <HistoricalChart currentPrice={coin.price} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">About {coin.name}</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
              <p>
                {coin.name} ({coin.symbol}) is currently ranked #{coin.rank} in the global cryptocurrency market. 
                It has a circulating supply of {formatLargeNumber(coin.circulating_supply)} {coin.symbol} 
                {coin.total_supply ? ` out of a total supply of ${formatLargeNumber(coin.total_supply)}` : ''}.
              </p>
              <p className="mt-4">
                Over the last 24 hours, the trading volume is roughly {formatLargeNumber(coin.volume_24h)}.
                The current market capitalization sits at {formatLargeNumber(coin.market_cap)}.
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4">
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 dark:text-gray-200 dark:bg-gray-900 dark:hover:bg-gray-700 transition-colors">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                Website
              </button>
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 dark:text-gray-200 dark:bg-gray-900 dark:hover:bg-gray-700 transition-colors">
                <Github className="w-4 h-4 mr-2 text-gray-400" />
                Source Code
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Stats Area */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-indigo-500" />
              Market Stats
            </h2>
            
            <dl className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">{formatLargeNumber(coin.market_cap)}</dd>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Volume (24h)</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">{formatLargeNumber(coin.volume_24h)}</dd>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Volume / Market Cap</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                  {coin.market_cap > 0 ? (coin.volume_24h / coin.market_cap).toFixed(4) : '---'}
                </dd>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Circulating Supply</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatLargeNumber(coin.circulating_supply)} <span className="text-gray-400 font-normal">{coin.symbol}</span>
                </dd>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Supply</dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatLargeNumber(coin.total_supply)} <span className="text-gray-400 font-normal">{coin.symbol}</span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800/30">
            <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-2 uppercase tracking-wide">
              Quick Action
            </h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">
              Simulate adding {coin.name} to your portfolio to track potential returns and risk metrics.
            </p>
            <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              Add to Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetail;
