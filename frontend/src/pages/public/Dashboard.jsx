import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Clock, ArrowUpRight, ArrowDownRight, Wallet, PieChart } from 'lucide-react';
import { getMarketSummary, getTopGainers } from '../../services/statsService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [marketStats, setMarketStats] = useState(null);
  const [topGainers, setTopGainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Run fetches in parallel
        const [statsData, gainersData] = await Promise.all([
          getMarketSummary().catch(() => null),
          getTopGainers({ limit: 4 }).catch(() => null),
        ]);
        
        if (statsData) setMarketStats(statsData);
        if (gainersData) setTopGainers(gainersData);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '---';
    if (val > 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val > 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Overview</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Market Cap */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                  <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Market Cap</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(marketStats?.totalMarketCap)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 24h Volume */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">24h Volume</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(marketStats?.totalVolume)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Average Asset Price</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(marketStats?.averagePrice)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Coins */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                  <PieChart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Tracked Coins</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {marketStats?.coinCount || '---'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area / Chart Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Market Trend Analysis</h2>
            <select className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last 1 year</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center">
              <LineChart className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Recharts integration pending (PR-11)</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-6">
          {/* Top Gainers */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                Top Performers
              </h2>
              <Link to="/market" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              {topGainers.length > 0 ? (
                topGainers.map((coin, idx) => (
                  <div key={coin._id || idx} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                        {coin.symbol?.substring(0, 2).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{coin.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{coin.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(coin.price)}</p>
                      <p className="text-xs font-medium text-emerald-500 flex items-center justify-end">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        {coin.percentage_change_24h?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No data available</div>
              )}
            </div>
          </div>

          {/* Portfolio Summary Placeholder */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 shadow-md rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 opacity-20">
              <Wallet className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h2 className="text-lg font-medium text-indigo-100 mb-1">My Portfolio</h2>
              <p className="text-3xl font-bold mb-4">$0.00</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2 px-4 rounded-lg text-sm font-medium backdrop-blur-sm">
                  Deposit
                </button>
                <button className="flex-1 bg-white hover:bg-gray-50 text-indigo-600 transition-colors py-2 px-4 rounded-lg text-sm font-medium shadow-sm">
                  Simulate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
