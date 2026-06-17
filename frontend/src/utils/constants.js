// API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Roles
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// Theme
export const THEME_KEY = 'crypto_theme';
export const TOKEN_KEY = 'crypto_token';
export const USER_KEY = 'crypto_user';

// Sort options for coin explorer
export const SORT_OPTIONS = [
  { label: 'Date (Newest)', value: 'date:desc' },
  { label: 'Date (Oldest)', value: 'date:asc' },
  { label: 'Price (High→Low)', value: 'price:desc' },
  { label: 'Price (Low→High)', value: 'price:asc' },
  { label: 'Market Cap (High→Low)', value: 'market_cap:desc' },
  { label: 'Volume (High→Low)', value: 'volume:desc' },
  { label: 'Daily Return (High→Low)', value: 'daily_return:desc' },
  { label: 'Rank (Ascending)', value: 'market_cap_rank:asc' },
];

// Quick filter chips
export const QUICK_FILTERS = [
  { label: 'High Price', key: 'high-price' },
  { label: 'Low Price', key: 'low-price' },
  { label: 'High Volume', key: 'high-volume' },
  { label: 'Low Volume', key: 'low-volume' },
  { label: 'High Market Cap', key: 'high-market-cap' },
  { label: 'Low Market Cap', key: 'low-market-cap' },
  { label: 'High Volatility', key: 'high-volatility' },
  { label: 'Low Volatility', key: 'low-volatility' },
  { label: 'High Return', key: 'high-return' },
  { label: 'Negative Return', key: 'negative-return' },
  { label: 'Bullish', key: 'bullish' },
  { label: 'Bearish', key: 'bearish' },
  { label: 'Profitable', key: 'profitable' },
  { label: 'Loss-Making', key: 'loss-making' },
  { label: 'Missing Values', key: 'missing-values' },
];

// Quick sort shortcuts
export const QUICK_SORTS = [
  { label: 'Price ↑', key: 'price-asc' },
  { label: 'Price ↓', key: 'price-desc' },
  { label: 'Volume ↓', key: 'volume-desc' },
  { label: 'Rank ↑', key: 'rank-asc' },
  { label: 'Return ↓', key: 'return-desc' },
];

// Market status colors
export const MARKET_STATUS_COLORS = {
  BULLISH: 'text-emerald-500',
  BEARISH: 'text-rose-500',
  NEUTRAL: 'text-gray-400',
};

// Search hint keywords
export const SEARCH_HINTS = ['bullish', 'bearish', 'profitable', 'loss-making', '2026-05', '2026-05-01'];
