/**
 * useRestoreCV - Restore a soft-deleted CV
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export function useRestoreCV(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cvId: string) => {
      return apiClient.post(`/cvs/${cvId}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-cvs'] });
      toast.success('CV restaurado exitosamente');
      onSuccess?.();
    },
    onError: () => {
      toast.error('Error al restaurar el CV');
    },
  });
}
