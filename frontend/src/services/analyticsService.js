import api from './api';

export const getHighestPrice = () => api.get('/analytics/price/highest').then((r) => r.data);
export const getLowestPrice = () => api.get('/analytics/price/lowest').then((r) => r.data);
export const getAnalyticsAveragePrice = () => api.get('/analytics/price/average').then((r) => r.data);
export const getPriceHistory = (coinId, params) =>
  api.get(`/analytics/price/history/${coinId}`, { params }).then((r) => r.data);
export const getPriceTrend = () => api.get('/analytics/price/trend').then((r) => r.data);
export const getPriceGrowth = (params) => api.get('/analytics/price/growth', { params }).then((r) => r.data);
export const getPriceDrop = (params) => api.get('/analytics/price/drop', { params }).then((r) => r.data);

export const getHighestVolume = () => api.get('/analytics/volume/highest').then((r) => r.data);
export const getLowestVolume = () => api.get('/analytics/volume/lowest').then((r) => r.data);
export const getAnalyticsAverageVolume = () => api.get('/analytics/volume/average').then((r) => r.data);
export const getVolumeSpikes = (params) => api.get('/analytics/volume/spike', { params }).then((r) => r.data);

export const getTopReturns = (params) => api.get('/analytics/returns/top', { params }).then((r) => r.data);
export const getNegativeReturns = (params) =>
  api.get('/analytics/returns/negative', { params }).then((r) => r.data);
export const getCumulativeReturns = (params) =>
  api.get('/analytics/returns/cumulative', { params }).then((r) => r.data);

export const getHighVolatilityList = (params) =>
  api.get('/analytics/volatility/high', { params }).then((r) => r.data);
