import { useState, useEffect } from 'react';
import { Wallet, PieChart, TrendingUp, TrendingDown, Plus, ArrowRight, Loader2, DollarSign } from 'lucide-react';
import { getCoins } from '../../services/coinService';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Cell, Pie, PieChart as RechartsPie, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const MOCK_HOLDINGS = {
  'bitcoin': { amount: 0.45, avgBuyPrice: 42000 },
  'ethereum': { amount: 4.2, avgBuyPrice: 2100 },
  'solana': { amount: 45.0, avgBuyPrice: 65 },
  'cardano': { amount: 5000, avgBuyPrice: 0.35 }
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

const Portfolio = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);
  const [totalProfitLoss, setTotalProfitLoss] = useState(0);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        // We'll fetch top 50 coins and filter out the ones we "hold"
        // In a real app, we'd query by exact IDs
        const response = await getCoins({ limit: 50 });
        const allCoins = response.data || [];
        
        let calculatedTotal = 0;
        let calculatedCost = 0;
        
        const holdingsData = Object.entries(MOCK_HOLDINGS).map(([id, holding]) => {
          const liveCoin = allCoins.find(c => c.id === id || c.name.toLowerCase() === id);
          
          if (liveCoin) {
            const currentValue = holding.amount * liveCoin.price;
            const costBasis = holding.amount * holding.avgBuyPrice;
            const profitLoss = currentValue - costBasis;
            const profitLossPercent = (profitLoss / costBasis) * 100;
            
            calculatedTotal += currentValue;
            calculatedCost += costBasis;
            
            return {
              ...liveCoin,
              ...holding,
              currentValue,
              costBasis,
              profitLoss,
              profitLossPercent
            };
          }
          return null;
        }).filter(Boolean);
        
        setAssets(holdingsData.sort((a, b) => b.currentValue - a.currentValue));
        setTotalValue(calculatedTotal);
        setTotalProfitLoss(calculatedTotal - calculatedCost);
      } catch (error) {
        toast.error('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '---';
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderPercentage = (val) => {
    if (val === undefined || val === null) return <span className="text-gray-500">---</span>;
    const isPositive = val >= 0;
    return (
      <span className={`font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'} flex items-center`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
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

  // Prepare Pie Chart Data
  const pieData = assets.map(a => ({
    name: a.symbol.toUpperCase(),
    value: a.currentValue
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Portfolio</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track your investments and overall performance
          </p>
        </div>
        
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg rounded-xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute right-0 bottom-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-10 -mb-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-indigo-100 font-medium text-lg flex items-center">
                <Wallet className="w-5 h-5 mr-2" /> Current Balance
              </h2>
            </div>
            <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {formatCurrency(totalValue)}
            </div>
            
            <div className="flex items-center gap-4 text-sm md:text-base bg-white/10 w-max px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
              <span className="text-indigo-100">All Time Profit:</span>
              <span className={`font-bold flex items-center ${totalProfitLoss >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)} 
                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  {((totalProfitLoss / (totalValue - totalProfitLoss)) * 100).toFixed(2)}%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Allocation Chart */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-indigo-500" /> Allocation
          </h3>
          <div className="flex-1 min-h-[200px]">
            {assets.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">No assets found</div>
            )}
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Assets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Holdings</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Buy Price</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit / Loss</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center shadow-inner border border-white/20">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          {asset.symbol?.substring(0, 1).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {asset.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {asset.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white font-medium">
                    {formatCurrency(asset.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(asset.currentValue)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {asset.amount} <span className="uppercase">{asset.symbol}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    {formatCurrency(asset.avgBuyPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium">
                      {renderPercentage(asset.profitLossPercent)}
                    </div>
                    <div className={`text-xs mt-0.5 ${asset.profitLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {asset.profitLoss >= 0 ? '+' : ''}{formatCurrency(asset.profitLoss)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/coins/${asset.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors inline-flex items-center">
                      Details <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </td>
                </tr>
              ))}
              
              {assets.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    You don't have any assets in your portfolio yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
