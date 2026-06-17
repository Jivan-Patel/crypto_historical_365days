import api from './api';

const base = (key) => (params) =>
  api.get(`/filter/${key}`, { params }).then((r) => r.data);

export const filterHighPrice = base('high-price');
export const filterLowPrice = base('low-price');
export const filterHighVolume = base('high-volume');
export const filterLowVolume = base('low-volume');
export const filterHighMarketCap = base('high-market-cap');
export const filterLowMarketCap = base('low-market-cap');
export const filterHighVolatility = base('high-volatility');
export const filterLowVolatility = base('low-volatility');
export const filterHighReturn = base('high-return');
export const filterNegativeReturn = base('negative-return');
export const filterBullish = base('bullish');
export const filterBearish = base('bearish');
export const filterProfitable = base('profitable');
export const filterLossMaking = base('loss-making');
export const filterMissingValues = base('missing-values');

export const FILTER_FN_MAP = {
  'high-price': filterHighPrice,
  'low-price': filterLowPrice,
  'high-volume': filterHighVolume,
  'low-volume': filterLowVolume,
  'high-market-cap': filterHighMarketCap,
  'low-market-cap': filterLowMarketCap,
  'high-volatility': filterHighVolatility,
  'low-volatility': filterLowVolatility,
  'high-return': filterHighReturn,
  'negative-return': filterNegativeReturn,
  bullish: filterBullish,
  bearish: filterBearish,
  profitable: filterProfitable,
  'loss-making': filterLossMaking,
  'missing-values': filterMissingValues,
};
