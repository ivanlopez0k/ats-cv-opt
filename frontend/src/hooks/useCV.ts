/**
 * useCV - Fetch single CV by ID
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import type { CV } from '@/lib/types';

export function useCV(id: string | undefined) {
  return useQuery({
    queryKey: ['cv', id],
    queryFn: async () => {
      if (!id) throw new Error('CV ID is required');
      const response = await apiClient.get(`/cvs/${id}`);
      return response.data.data as CV;
    },
    enabled: !!id,
  });
}
