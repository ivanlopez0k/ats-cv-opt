'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import type { CV } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/authStore';
import { useI18n } from '@/i18n';
import Link from 'next/link';

interface CVActionsProps {
  cv: CV;
}

/**
 * Client Island: Interactive actions for a CV card
 * This component handles voting and navigation - requires client-side JS
 */
export function CVActions({ cv }: CVActionsProps) {
  const { t } = useI18n();
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
      queryClient.invalidateQueries({ queryKey: ['user-cvs'] });
      if (cv.hasVoted) {
        toast.success(t('cvDetail.cvActions.voteRemoved'));
      } else {
        toast.success(t('cvDetail.cvActions.votedSuccess'));
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t('cvDetail.cvActions.voteError'));
    },
  });

  const handleVote = () => {
    if (!isAuthenticated) {
      toast.error(t('cvDetail.cvActions.mustLogin'));
      return;
    }
    voteMutation.mutate();
  };

  const handleView = () => {
    window.location.href = `/community/${cv.id}`;
  };

  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        <ThumbsUp className="h-4 w-4" />
        {cv.upvotes}
      </span>
      <div className="flex gap-2">
        {isAuthenticated ? (
          <Button
            size="sm"
            onClick={handleVote}
            disabled={voteMutation.isPending}
            variant={cv.hasVoted ? 'default' : 'outline'}
            className={cv.hasVoted ? 'bg-foreground/70 text-background' : ''}
          >
            <ThumbsUp className={`h-4 w-4 mr-1 ${cv.hasVoted ? 'fill-current' : ''}`} />
            {cv.hasVoted ? t('cvDetail.cvActions.votedLabel') : t('cvDetail.cvActions.vote')}
          </Button>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm">{t('cvDetail.cvActions.vote')}</Button>
          </Link>
        )}
        <Button variant="outline" size="sm" onClick={handleView}>
          {t('cvDetail.cvActions.viewCv')}
        </Button>
      </div>
    </div>
  );
}