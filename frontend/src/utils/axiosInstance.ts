// External imports
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export const ACCESS_TOKEN_KEY = 'access_token';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { useAuthStore } = await import('@/stores/authstore');
  const authStore = useAuthStore();
  const token = authStore.token ?? localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const { useAuthStore } = await import('@/stores/authstore');
      const authStore = useAuthStore();
      authStore.clearSession();

      const onLoginRoute =
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/login');

      if (!onLoginRoute) {
        const { default: router } = await import('@/router');
        await router.push('/');
      }
    }
    return Promise.reject(error);
  },
);

export { axiosInstance };
