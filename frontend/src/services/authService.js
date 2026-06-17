import api from './api';

export const register = (username, email, password) =>
  api.post('/auth/register', { username, email, password }).then((r) => r.data);

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

export const logout = () =>
  api.post('/auth/logout').then((r) => r.data);

export const getProfile = () =>
  api.get('/auth/profile').then((r) => r.data);

export const updateProfile = (data) =>
  api.patch('/auth/profile', data).then((r) => r.data);

export const deleteProfile = () =>
  api.delete('/auth/profile').then((r) => r.data);

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', { token, newPassword }).then((r) => r.data);

export const changePassword = (oldPassword, newPassword) =>
  api.post('/auth/change-password', { oldPassword, newPassword }).then((r) => r.data);

export const verifyEmail = (token) =>
  api.post('/auth/verify-email', { token }).then((r) => r.data);
