/**
 * useCVs - Fetch paginated list of user's CVs
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import type { CV } from '@/lib/types';

interface UseCVsOptions {
  page?: number;
  limit?: number;
}

interface UseCVsResult {
  cvs: CV[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
}

export function useCVs({ page = 1, limit = 20 }: UseCVsOptions = {}): UseCVsResult {
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['cvs', page, limit],
    queryFn: async () => {
      const response = await apiClient.get('/cvs', { params: { page, limit } });
      return response.data;
    },
  });

  return {
    cvs: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    error,
    isFetching,
  };
}
