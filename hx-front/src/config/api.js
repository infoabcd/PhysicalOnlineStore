const rawBase = import.meta.env.VITE_API_BASE_URL;
const defaultBase = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3000';

const trimTrailingSlash = (url) => url?.replace(/\/+$/, '') || '';
const ensureLeadingSlash = (path = '') => (path.startsWith('/') ? path : `/${path}`);

export const apiBaseUrl = trimTrailingSlash(rawBase ?? defaultBase) || 'http://localhost:3000';

export const apiUrl = (path = '') => {
  if (!path) {
    return apiBaseUrl;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${apiBaseUrl}${ensureLeadingSlash(path)}`;
};

export const apiFetch = (path, options) => fetch(apiUrl(path), options);

export const mediaImageUrl = (file) => {
  if (!file) {
    return '';
  }
  if (/^https?:\/\//i.test(file)) {
    return file;
  }
  const normalized = String(file).replace(/^\/+/, '');
  return apiUrl(`/media/images/${normalized}`);
};
