/**
 * useTogglePublic - Toggle CV public/private status
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export function useTogglePublic(cvId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currentIsPublic: boolean) => {
      return apiClient.patch(`/cvs/${cvId}`, { isPublic: !currentIsPublic });
    },
    onSuccess: (_, currentIsPublic) => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      queryClient.invalidateQueries({ queryKey: ['cv', cvId] });
      toast.success(
        currentIsPublic ? 'CV vuelto privado' : 'CV compartido con la comunidad'
      );
    },
    onError: () => {
      toast.error('Error al actualizar');
    },
  });
}
