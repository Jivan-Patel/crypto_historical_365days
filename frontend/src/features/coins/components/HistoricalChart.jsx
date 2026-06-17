import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateMockHistory = (basePrice) => {
  const data = [];
  let currentPrice = basePrice || 100;
  const now = new Date();
  
  // Generate 90 days of data
  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const volatility = currentPrice * 0.05; // 5% daily volatility
    const change = (Math.random() - 0.48) * volatility; 
    currentPrice = Math.max(0.01, currentPrice + change);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: currentPrice,
    });
  }
  return data;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const formattedVal = val < 1 
      ? `$${val.toFixed(4)}` 
      : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="font-bold text-indigo-600 dark:text-indigo-400">
          {formattedVal}
        </p>
      </div>
    );
  }
  return null;
};

const HistoricalChart = ({ currentPrice }) => {
  const [timeframe, setTimeframe] = useState('30D');
  // Generate data once based on current price
  const [fullData] = useState(() => generateMockHistory(currentPrice));
  
  // Filter data based on selected timeframe
  const getFilteredData = () => {
    switch(timeframe) {
      case '7D': return fullData.slice(fullData.length - 7);
      case '30D': return fullData.slice(fullData.length - 30);
      case '90D': return fullData;
      default: return fullData;
    }
  };

  const data = getFilteredData();
  
  // Determine if trend is up or down to color the chart
  const startPrice = data[0]?.price || 0;
  const endPrice = data[data.length - 1]?.price || 0;
  const isPositive = endPrice >= startPrice;
  const strokeColor = isPositive ? '#10b981' : '#ef4444'; // emerald-500 or red-500

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end space-x-2 mb-4">
        {['7D', '30D', '90D'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              timeframe === tf
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              dy={10}
              minTickGap={20}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(val) => val < 1 ? `$${val.toFixed(2)}` : `$${val.toLocaleString()}`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={strokeColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalChart;
