import api from './api';

export const getAdminCoins = (params) =>
  api.get('/admin/coins', { params }).then((r) => r.data);

export const getAdminUsers = (params) =>
  api.get('/admin/users', { params }).then((r) => r.data);

export const getAdminStats = () =>
  api.get('/admin/stats').then((r) => r.data);
