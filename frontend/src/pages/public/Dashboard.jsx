import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Clock, ArrowUpRight, ArrowDownRight, Wallet, PieChart } from 'lucide-react';
import { getMarketSummary, getTopGainers } from '../../services/statsService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import MarketTrendChart from '../../features/dashboard/components/MarketTrendChart';
import TopVolumeChart from '../../features/dashboard/components/TopVolumeChart';

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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">Market Overview</h1>
        <div className="flex items-center space-x-2 text-sm font-medium px-4 py-2 bg-white/50 dark:bg-slate-800/50 rounded-full backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-sm text-slate-600 dark:text-slate-300">
          <Clock className="h-4 w-4 text-indigo-500" />
          <span>Live Updates</span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Market Cap */}
        <div className="glass-card rounded-2xl p-6 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="flex items-center relative z-10">
            <div className="flex-shrink-0">
              <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 text-white">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">Total Market Cap</dt>
                <dd className="flex items-baseline mt-1">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrency(marketStats?.totalMarketCap)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* 24h Volume */}
        <div className="glass-card rounded-2xl p-6 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="flex items-center relative z-10">
            <div className="flex-shrink-0">
              <div className="p-3.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30 text-white">
                <Activity className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">24h Volume</dt>
                <dd className="flex items-baseline mt-1">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrency(marketStats?.totalVolume)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Average Price */}
        <div className="glass-card rounded-2xl p-6 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="flex items-center relative z-10">
            <div className="flex-shrink-0">
              <div className="p-3.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">Average Asset Price</dt>
                <dd className="flex items-baseline mt-1">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrency(marketStats?.averagePrice)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Active Coins */}
        <div className="glass-card rounded-2xl p-6 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="flex items-center relative z-10">
            <div className="flex-shrink-0">
              <div className="p-3.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30 text-white">
                <PieChart className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">Active Tracked Coins</dt>
                <dd className="flex items-baseline mt-1">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {marketStats?.coinCount || '---'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area / Chart Placeholder */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Market Trend Analysis</h2>
              <select className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block px-4 py-2 shadow-sm">
                <option>Last 30 days</option>
              </select>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden">
              <MarketTrendChart />
            </div>
          </div>
          
          <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Top 10 Volume (24h)</h2>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden">
              <TopVolumeChart />
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-8">
          {/* Top Gainers */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg mr-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                Top Performers
              </h2>
              <Link to="/market" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                View all
              </Link>
            </div>
            
            <div className="space-y-3 relative z-10">
              {topGainers.length > 0 ? (
                topGainers.map((coin, idx) => (
                  <div key={coin._id || idx} className="flex items-center justify-between group cursor-pointer p-3 -mx-3 rounded-2xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-black text-sm shadow-inner group-hover:scale-110 transition-transform duration-300">
                        {coin.symbol?.substring(0, 2).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{coin.name}</p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mt-0.5">{coin.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{formatCurrency(coin.price)}</p>
                      <p className="text-xs font-bold text-emerald-500 flex items-center justify-end mt-0.5 bg-emerald-500/10 px-1.5 py-0.5 rounded-md inline-flex">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        {coin.percentage_change_24h?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">No data available</div>
              )}
            </div>
          </div>

          {/* Portfolio Summary Placeholder */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 shadow-xl shadow-indigo-500/20 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -right-10 -top-10 opacity-10 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
              <Wallet className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h2 className="text-sm font-bold text-indigo-100 uppercase tracking-wider mb-2 opacity-80">My Portfolio</h2>
              <p className="text-4xl font-black mb-8 tracking-tight drop-shadow-sm">$0.00</p>
              <div className="flex gap-3">
                <button className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-3 px-4 rounded-xl text-sm font-bold backdrop-blur-md border border-white/20 shadow-sm">
                  Deposit
                </button>
                <button className="flex-1 bg-white hover:bg-indigo-50 text-indigo-700 transition-colors py-3 px-4 rounded-xl text-sm font-bold shadow-lg shadow-white/10">
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
