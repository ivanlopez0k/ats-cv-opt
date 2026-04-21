'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Clock, CheckCircle, XCircle, MoreVertical, Globe, Lock, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CVUploadDialog } from './CVUploadDialog';
import Link from 'next/link';
import { toast } from 'sonner';
import type { CV } from '@/lib/types';
import { useCVs, useTogglePublic, useDeleteCV } from '@/hooks';
import { useI18n } from '@/i18n';

function CVCardSkeleton() {
  return <Card className="bg-card"><CardHeader><Skeleton className="h-6 w-48 bg-secondary" /><Skeleton className="h-4 w-32 mt-2 bg-secondary" /></CardHeader><CardContent><Skeleton className="h-4 w-full bg-secondary" /></CardContent></Card>;
}

function CVCard({ cv }: { cv: CV }) {
  const { t } = useI18n();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const statusConfig = { 
    PROCESSING: { icon: Clock, variant: 'secondary' as const, text: t('dashboard.cvList.status.processing') }, 
    COMPLETED: { icon: CheckCircle, variant: 'default' as const, text: t('dashboard.cvList.status.completed') }, 
    FAILED: { icon: XCircle, variant: 'destructive' as const, text: t('dashboard.cvList.status.failed') } 
  };
  const status = statusConfig[cv.status];

  const togglePublicMutation = useTogglePublic(cv.id);
  const deleteMutation = useDeleteCV(() => setShowDeleteDialog(false));

  return (
    <>
    <Card className="bg-card hover:shadow-lg transition-all">
      <div onClick={() => window.location.href = `/cvs/${cv.id}`} className="cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg text-foreground">{cv.title}</CardTitle>
              <CardDescription className="text-muted-foreground">{cv.targetJob && <span>{cv.targetJob}</span>}{cv.targetJob && cv.targetIndustry && <span> · </span>}{cv.targetIndustry && <span>{cv.targetIndustry}</span>}</CardDescription>
            </div>
            <Badge variant={status.variant} className="flex items-center gap-1"><status.icon className="h-3 w-3" />{status.text}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {cv.isPublic ? <span className="flex items-center gap-1"><Globe className="h-4 w-4" />{t('dashboard.cvList.visibility.public')}</span> : <span className="flex items-center gap-1"><Lock className="h-4 w-4" />{t('dashboard.cvList.visibility.private')}</span>}
              {cv.upvotes > 0 && <span>{cv.upvotes} {t('dashboard.cvList.votes')}</span>}
            </div>
            <div className="flex items-center gap-2">
              {cv.improvedPdfUrl && (
                <a href={cv.improvedPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <ExternalLink className="h-3 w-3" /> {t('dashboard.cvList.actions.viewImproved')}
                </a>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <span className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-border" align="end">
                  <DropdownMenuItem onClick={() => window.location.href = `/cvs/${cv.id}`}><FileText className="mr-2 h-4 w-4" /><span className="text-foreground">{t('dashboard.cvList.actions.viewDetail')}</span></DropdownMenuItem>
                  <DropdownMenuItem><a href={cv.originalPdfUrl} target="_blank" rel="noopener noreferrer" className="text-foreground">{t('dashboard.cvList.actions.originalPdf')}</a></DropdownMenuItem>
                  {cv.improvedPdfUrl && <DropdownMenuItem><a href={cv.improvedPdfUrl} target="_blank" rel="noopener noreferrer" className="text-foreground">{t('dashboard.cvList.actions.improvedPdf')}</a></DropdownMenuItem>}
                  {cv.status === 'COMPLETED' && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        togglePublicMutation.mutate(cv.isPublic);
                      }}
                      disabled={togglePublicMutation.isPending}
                    >
                      {cv.isPublic ? (
                        <><Lock className="mr-2 h-4 w-4" /><span className="text-foreground">{t('dashboard.cvList.actions.makePrivate')}</span></>
                      ) : (
                        <><Globe className="mr-2 h-4 w-4" /><span className="text-foreground">{t('dashboard.cvList.actions.shareCommunity')}</span></>
                      )}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /><span>{t('dashboard.cvList.actions.delete')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {cv.analysisResult && cv.status === 'COMPLETED' && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <span className="text-sm text-muted-foreground">{t('dashboard.cvList.atsScore')}: </span>
              <span className={`font-semibold ${cv.analysisResult.score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : cv.analysisResult.score >= 40 ? 'text-yellow-500' : 'text-destructive'}`}>{cv.analysisResult.score}/100</span>
            </div>
          )}
        </CardContent>
      </div>
    </Card>

    {/* Delete Confirmation Dialog */}
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t('dashboard.cvList.deleteDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('dashboard.cvList.deleteDialog.message')} <strong>"{cv.title}"</strong>{t('dashboard.cvList.deleteDialog.messageEnd')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
            disabled={deleteMutation.isPending}
          >
            {t('dashboard.cvList.deleteDialog.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate(cv.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? t('dashboard.cvList.deleteDialog.deleting') : t('dashboard.cvList.deleteDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

export function CVList() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [allCVs, setAllCVs] = useState<CV[]>([]);
  const LIMIT = 20;

  const { cvs, pagination, isLoading, error, isFetching } = useCVs({ page, limit: LIMIT });

  // Accumulate CVs as user loads more pages
  useEffect(() => {
    if (cvs.length > 0) {
      if (page === 1) {
        setAllCVs(cvs);
      } else {
        setAllCVs((prev) => [...prev, ...cvs]);
      }
    }
  }, [cvs, page]);

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;
  const totalPages = pagination?.totalPages || 0;

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <CVCardSkeleton key={i} />)}</div>;
  if (error) return <Card className="bg-card"><CardContent className="py-8 text-center text-muted-foreground">{t('dashboard.cvList.error')}</CardContent></Card>;
  if (!allCVs.length) return (
    <Card className="bg-card">
      <CardContent className="py-12 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-foreground">{t('dashboard.cvList.empty.title')}</h3>
        <p className="text-muted-foreground mb-4">{t('dashboard.cvList.empty.description')}</p>
        <CVUploadDialog trigger={
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            {t('dashboard.cvList.empty.button')}
          </Button>
        } />
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCVs.map((cv) => <CVCard key={cv.id} cv={cv} />)}
      </div>

      {/* Pagination info and Load More button */}
      {hasMore && (
        <div className="flex flex-col items-center gap-3 mt-8">
          <p className="text-sm text-muted-foreground">
            {t('dashboard.cvList.pagination.showing')} {allCVs.length} {t('dashboard.cvList.pagination.of')} {pagination?.total || 0} {t('dashboard.cvList.pagination.cvs')} ({t('dashboard.cvList.pagination.page')} {page} {t('dashboard.cvList.pagination.of2')} {totalPages})
          </p>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="border-border text-foreground hover:bg-secondary"
          >
            {isFetching ? t('dashboard.cvList.pagination.loading') : t('dashboard.cvList.pagination.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}

