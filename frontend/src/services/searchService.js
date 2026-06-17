import api from './api';

export const searchCoins = (q, params = {}) =>
  api.get('/search/coins', { params: { q, ...params } }).then((r) => r.data);
