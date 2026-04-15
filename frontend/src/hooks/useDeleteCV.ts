/**
 * useDeleteCV - Delete a CV
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export function useDeleteCV(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cvId: string) => {
      return apiClient.delete(`/cvs/${cvId}`);
    },
    onSuccess: (_, cvId) => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      queryClient.invalidateQueries({ queryKey: ['cv', cvId] });
      toast.success('CV eliminado');
      onSuccess?.();
    },
    onError: () => {
      toast.error('Error al eliminar el CV');
    },
  });
}
