/**
 * useDeletedCVs - Fetch list of soft-deleted CVs
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import type { CV } from '@/lib/types';

export function useDeletedCVs() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['deleted-cvs'],
    queryFn: async () => {
      const response = await apiClient.get('/cvs/deleted');
      return response.data.data as CV[];
    },
  });

  return {
    cvs: data || [],
    isLoading,
    error,
  };
}
