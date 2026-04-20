'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import type { CV } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/authStore';

interface CVVotingProps {
  cv: CV;
}

/**
 * Client Island: Voting for a CV
 * Shows vote button for authenticated users
 */
export function CVVoting({ cv }: CVVotingProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const voteMutation = useMutation({
    mutationFn: async () => {
      if (cv.hasVoted) {
        await apiClient.delete(`/community/cvs/${cv.id}/vote`);
      } else {
        await apiClient.post(`/community/cvs/${cv.id}/vote`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-cv', cv.id] });
      if (cv.hasVoted) {
        toast.success('Voto eliminado');
      } else {
        toast.success('¡Votado!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al votar');
    },
  });

  const handleVote = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para votar');
      return;
    }
    voteMutation.mutate();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="bg-card mb-6">
      <CardContent className="py-4">
        <div className="flex justify-center">
          <Button
            onClick={handleVote}
            disabled={voteMutation.isPending}
            variant={cv.hasVoted ? 'default' : 'outline'}
            className={cv.hasVoted ? 'bg-foreground/70 text-background' : 'border-border text-foreground'}
          >
            <ThumbsUp className={`mr-2 h-4 w-4 ${cv.hasVoted ? 'fill-current' : ''}`} />
            {cv.hasVoted ? 'Votado' : 'Votar este CV'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}