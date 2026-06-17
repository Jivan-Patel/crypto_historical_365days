import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getCoins } from '../../../services/coinService';
import { Loader2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    // Format to billions/millions
    let formattedVal = val;
    if (val >= 1e9) formattedVal = `$${(val / 1e9).toFixed(2)}B`;
    else if (val >= 1e6) formattedVal = `$${(val / 1e6).toFixed(2)}M`;
    else formattedVal = `$${val.toLocaleString()}`;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">{label}</p>
        <p className="text-sm text-indigo-600 dark:text-indigo-400">
          Vol: {formattedVal}
        </p>
      </div>
    );
  }
  return null;
};

const TopVolumeChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopVolume = async () => {
      try {
        const response = await getCoins({
          sort_by: 'volume_24h',
          sort_order: 'desc',
          limit: 10,
        });
        
        // Transform for Recharts
        const chartData = (response.data || []).map(coin => ({
          name: coin.symbol.toUpperCase(),
          volume: coin.volume_24h,
          fullName: coin.name
        }));
        
        setData(chartData);
      } catch (error) {
        console.error('Failed to load volume data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopVolume();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[300px] text-gray-500">
        No volume data available
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={(val) => {
              if (val >= 1e9) return `$${(val / 1e9).toFixed(0)}B`;
              if (val >= 1e6) return `$${(val / 1e6).toFixed(0)}M`;
              return `$${val}`;
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#6366f1', opacity: 0.05 }} />
          <Bar dataKey="volume" radius={[4, 4, 0, 0]} animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopVolumeChart;
