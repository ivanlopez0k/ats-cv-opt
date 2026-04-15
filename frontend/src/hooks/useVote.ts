/**
 * useVote - Vote or unvote a community CV
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export function useVote(cvId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hasVoted: boolean) => {
      if (hasVoted) {
        return apiClient.delete(`/community/cvs/${cvId}/vote`);
      }
      return apiClient.post(`/community/cvs/${cvId}/vote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-cvs'] });
      queryClient.invalidateQueries({ queryKey: ['top-cvs'] });
      queryClient.invalidateQueries({ queryKey: ['community-cv', cvId] });
    },
    onError: () => {
      toast.error('Error al votar');
    },
  });
}
