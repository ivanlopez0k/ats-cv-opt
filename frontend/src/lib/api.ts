import axios from 'axios';
import { useAuthStore } from '@/lib/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // ============================================================
  // SECURE COOKIES SUPPORT
  // When the backend uses HttpOnly cookies, we need to send
  // credentials with every request so the browser includes them.
  // ============================================================
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  // Still attach Bearer token if available (backward compat with dev mode)
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      // If we have a refresh token in store, use it (dev mode)
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          useAuthStore
            .getState()
            .setAuth(useAuthStore.getState().user!, accessToken, newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch {
          useAuthStore.getState().logout();
        }
      } else {
        // ============================================================
        // COOKIE MODE: Try to refresh via cookie
        // The backend will read the HttpOnly cookie automatically.
        // ============================================================
        try {
          const response = await apiClient.post(`${API_URL}/auth/refresh`, {
            refreshToken: '__cookie__',
          });
          const { accessToken } = response.data.data;
          if (response.data.data.user) {
            useAuthStore.getState().setAuth(
              response.data.data.user,
              accessToken,
              response.data.data.refreshToken
            );
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          // Refresh also failed — user is truly unauthenticated
          useAuthStore.getState().logout();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
