import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const cfg: InternalAxiosRequestConfig = config;

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      if (!cfg.headers) cfg.headers = {} as any;
      (cfg.headers as Record<string, any>)['Authorization'] = `Bearer ${token}`;
    }
  }

  if (!cfg.headers) cfg.headers = {} as any;
  const GlobalFormData = (globalThis as any).FormData;
  const isFormData = cfg.data && typeof GlobalFormData !== 'undefined' && cfg.data instanceof GlobalFormData;
  // If it's not FormData, default to application/json
  if (!isFormData && !(cfg.headers as Record<string, any>)['Content-Type']) {
    (cfg.headers as Record<string, any>)['Content-Type'] = 'application/json';
  }

  return cfg;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized', {
        url: error.config?.url,
        method: error.config?.method,
        hasToken: typeof window !== 'undefined' && !!localStorage.getItem('token'),
        message: error.response?.data?.message,
      });
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
