import api from './api';

export const getTotalMarketCap = () => api.get('/stats/market-cap').then((r) => r.data);
export const getAveragePrice = () => api.get('/stats/average-price').then((r) => r.data);
export const getAverageVolume = () => api.get('/stats/average-volume').then((r) => r.data);
export const getHighestMarketCapCoin = () => api.get('/stats/highest-market-cap').then((r) => r.data);
export const getHighestVolumeCoin = () => api.get('/stats/highest-volume').then((r) => r.data);
export const getTopGainers = (params) => api.get('/stats/top-gainers', { params }).then((r) => r.data);
export const getTopLosers = (params) => api.get('/stats/top-losers', { params }).then((r) => r.data);
export const getMonthlyAnalysis = () => api.get('/stats/monthly-analysis').then((r) => r.data);
export const getCoinCount = () => api.get('/stats/coin-count').then((r) => r.data);
export const getRankDistribution = () => api.get('/stats/rank-distribution').then((r) => r.data);
export const getPriceDistribution = () => api.get('/stats/price-distribution').then((r) => r.data);
export const getVolatilityDistribution = () => api.get('/stats/volatility-distribution').then((r) => r.data);
export const getMarketSummary = () => api.get('/stats/market-summary').then((r) => r.data);
export const getDailyAnalysis = () => api.get('/stats/daily-analysis').then((r) => r.data);
export const getYearlyAnalysis = () => api.get('/stats/yearly-analysis').then((r) => r.data);
