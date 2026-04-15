/**
 * useCommunityCVs - Fetch paginated community CVs with optional filters
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import type { CV } from '@/lib/types';

interface UseCommunityCVsOptions {
  page?: number;
  limit?: number;
  targetJob?: string;
  targetIndustry?: string;
  minScore?: string;
}

interface UseCommunityCVsResult {
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

export function useCommunityCVs({
  page = 1,
  limit = 12,
  targetJob,
  targetIndustry,
  minScore,
}: UseCommunityCVsOptions = {}): UseCommunityCVsResult {
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['community-cvs', page, limit, targetJob, targetIndustry, minScore],
    queryFn: async () => {
      const response = await apiClient.get('/community/cvs', {
        params: { page, limit, targetJob, targetIndustry, minScore },
      });
      return response.data;
    },
  });

  return {
    cvs: data?.data?.cvs || [],
    pagination: data?.data?.pagination || null,
    isLoading,
    error,
    isFetching,
  };
}
