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

    // Avoid infinite retry loops - only attempt refresh once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, user } = useAuthStore.getState();

      // If we have a refresh token, try to refresh
      if (refreshToken && user) {
        try {
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
          useAuthStore.getState().setAuth(user, newAccessToken, newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError: any) {
          // Refresh failed - user is truly unauthenticated
          // Only logout if the refresh endpoint confirmed failure (not a network error)
          if (refreshError.response?.status === 401) {
            useAuthStore.getState().logout();
          }
          // Don't retry - just reject the original request
          return Promise.reject(error);
        }
      }

      // No refresh token - just logout and reject
      if (!refreshToken) {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
