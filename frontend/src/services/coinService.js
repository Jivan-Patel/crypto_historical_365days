import api from './api';

export const getCoins = (params) => api.get('/coins', { params }).then((r) => r.data);
export const getCoinById = (id) => api.get(`/coins/${id}`).then((r) => r.data);
export const createCoin = (data) => api.post('/protected/coins', data).then((r) => r.data);
export const updateCoin = (id, data) => api.put(`/protected/coins/${id}`, data).then((r) => r.data);
export const patchCoin = (id, data) => api.patch(`/protected/coins/${id}`, data).then((r) => r.data);
export const deleteCoin = (id) => api.delete(`/protected/coins/${id}`).then((r) => r.data);
export const coinExists = (id) => api.get(`/coins/exists/${id}`).then((r) => r.data);

// Sorting
export const sortPriceAsc = (params) => api.get('/coins/sort/price-asc', { params }).then((r) => r.data);
export const sortPriceDesc = (params) => api.get('/coins/sort/price-desc', { params }).then((r) => r.data);
export const sortVolumeDesc = (params) => api.get('/coins/sort/volume-desc', { params }).then((r) => r.data);
export const sortRankAsc = (params) => api.get('/coins/sort/rank-asc', { params }).then((r) => r.data);
export const sortReturnDesc = (params) => api.get('/coins/sort/return-desc', { params }).then((r) => r.data);

// Discovery
export const getRandomCoin = () => api.get('/coins/random').then((r) => r.data);
export const getRecommendations = () => api.get('/coins/recommendations').then((r) => r.data);
export const getPredictions = () => api.get('/coins/predictions').then((r) => r.data);
export const simulatePortfolio = (assets) =>
  api.get('/coins/portfolio/simulate', { params: { assets } }).then((r) => r.data);
export const getHeatmap = () => api.get('/coins/heatmap').then((r) => r.data);
export const getMarketStatus = () => api.get('/coins/market-status').then((r) => r.data);
export const getTopMonthlyPerformers = () => api.get('/coins/performance/top-monthly').then((r) => r.data);
export const getTopYearlyPerformers = () => api.get('/coins/performance/top-yearly').then((r) => r.data);
export const getVolatilityAlerts = () => api.get('/coins/alerts/high-volatility').then((r) => r.data);
export const getMarketDropAlerts = () => api.get('/coins/alerts/market-drop').then((r) => r.data);

// System
export const getSystemHealth = () => api.get('/coins/system/health').then((r) => r.data);
export const getSystemVersion = () => api.get('/coins/system/version').then((r) => r.data);
export const getSystemConfig = () => api.get('/coins/system/config').then((r) => r.data);

// Export
export const getExportCsvUrl = () => `${import.meta.env.VITE_API_BASE_URL}/coins/export/csv`;
export const getExportJsonUrl = () => `${import.meta.env.VITE_API_BASE_URL}/coins/export/json`;

// Compare
export const compareTwoCoins = (c1, c2, params) =>
  api.get(`/coins/compare/${c1}/${c2}`, { params }).then((r) => r.data);
export const compareThreeCoins = (c1, c2, c3, params) =>
  api.get(`/coins/compare/${c1}/${c2}/${c3}`, { params }).then((r) => r.data);
