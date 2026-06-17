import { TOKEN_KEY, USER_KEY, THEME_KEY } from './constants';

// ─── Generic helpers ─────────────────────────────────────────────────────────

export const getLocal = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const setLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
};

export const removeLocal = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
};

// ─── Auth-specific helpers ───────────────────────────────────────────────────

export const getToken = () => getLocal(TOKEN_KEY);
export const setToken = (token) => setLocal(TOKEN_KEY, token);
export const removeToken = () => removeLocal(TOKEN_KEY);

export const getStoredUser = () => getLocal(USER_KEY);
export const setStoredUser = (user) => {
  const safe = { ...user };
  delete safe.password;
  setLocal(USER_KEY, safe);
};
export const removeStoredUser = () => removeLocal(USER_KEY);

export const clearAuthStorage = () => {
  removeToken();
  removeStoredUser();
};
