import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

// Attach token to every request
api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('trustty-auth') || '{}');
  const token = auth?.state?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('trustty-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
