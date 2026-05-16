import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const isVendorPath = window.location.pathname.startsWith('/vendor');
  const token = isVendorPath
    ? localStorage.getItem('vendorToken')
    : localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isVendorPath = window.location.pathname.startsWith('/vendor');
      if (isVendorPath) {
        localStorage.removeItem('vendorToken');
        localStorage.removeItem('vendor');
        window.location.href = '/vendor/login';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
