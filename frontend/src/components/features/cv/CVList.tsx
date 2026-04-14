'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Clock, CheckCircle, XCircle, MoreVertical, Globe, Lock, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CVUploadDialog } from './CVUploadDialog';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { CV } from '@/lib/types';

function CVCardSkeleton() {
  return <Card className="bg-card"><CardHeader><Skeleton className="h-6 w-48 bg-secondary" /><Skeleton className="h-4 w-32 mt-2 bg-secondary" /></CardHeader><CardContent><Skeleton className="h-4 w-full bg-secondary" /></CardContent></Card>;
}

function CVCard({ cv }: { cv: CV }) {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const statusConfig = { PROCESSING: { icon: Clock, variant: 'secondary' as const, text: 'Procesando' }, COMPLETED: { icon: CheckCircle, variant: 'default' as const, text: 'Listo' }, FAILED: { icon: XCircle, variant: 'destructive' as const, text: 'Fallido' } };
  const status = statusConfig[cv.status];

  const togglePublicMutation = useMutation({
    mutationFn: async () => {
      return apiClient.patch(`/cvs/${cv.id}`, { isPublic: !cv.isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      toast.success(cv.isPublic ? 'CV vuelto privado' : 'CV compartido con la comunidad');
    },
    onError: () => {
      toast.error('Error al actualizar');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/cvs/${cv.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      toast.success('CV eliminado');
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error('Error al eliminar el CV');
    },
  });

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
              {cv.isPublic ? <span className="flex items-center gap-1"><Globe className="h-4 w-4" />Público</span> : <span className="flex items-center gap-1"><Lock className="h-4 w-4" />Privado</span>}
              {cv.upvotes > 0 && <span>{cv.upvotes} votos</span>}
            </div>
            <div className="flex items-center gap-2">
              {cv.improvedPdfUrl && (
                <a href={cv.improvedPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <ExternalLink className="h-3 w-3" /> Ver mejorado
                </a>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-border" align="end">
                  <DropdownMenuItem onClick={() => window.location.href = `/cvs/${cv.id}`}><FileText className="mr-2 h-4 w-4" /><span className="text-foreground">Ver detalle</span></DropdownMenuItem>
                  <DropdownMenuItem><a href={cv.originalPdfUrl} target="_blank" rel="noopener noreferrer" className="text-foreground">PDF original</a></DropdownMenuItem>
                  {cv.improvedPdfUrl && <DropdownMenuItem><a href={cv.improvedPdfUrl} target="_blank" rel="noopener noreferrer" className="text-foreground">PDF mejorado</a></DropdownMenuItem>}
                  {cv.status === 'COMPLETED' && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        togglePublicMutation.mutate();
                      }}
                      disabled={togglePublicMutation.isPending}
                    >
                      {cv.isPublic ? (
                        <><Lock className="mr-2 h-4 w-4" /><span className="text-foreground">Volver privado</span></>
                      ) : (
                        <><Globe className="mr-2 h-4 w-4" /><span className="text-foreground">Compartir en la comunidad</span></>
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
                    <Trash2 className="mr-2 h-4 w-4" /><span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {cv.analysisResult && cv.status === 'COMPLETED' && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Score ATS: </span>
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
            Eliminar CV
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que querés eliminar <strong>"{cv.title}"</strong>? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(false)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

export function CVList() {
  const [page, setPage] = useState(1);
  const [allCVs, setAllCVs] = useState<CV[]>([]);
  const LIMIT = 20;
  const queryClient = useQueryClient();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['cvs', page],
    queryFn: async () => {
      const response = await apiClient.get('/cvs', { params: { page, limit: LIMIT } });
      return response.data;
    },
  });

  // Accumulate CVs as user loads more pages
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllCVs(data.data);
      } else {
        setAllCVs((prev) => [...prev, ...data.data]);
      }
    }
  }, [data, page]);

  const hasMore = data?.pagination?.page < data?.pagination?.totalPages;
  const totalPages = data?.pagination?.totalPages || 0;

  // Refetch when page changes
  const refetchPage = () => {
    queryClient.invalidateQueries({ queryKey: ['cvs', page] });
  };

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <CVCardSkeleton key={i} />)}</div>;
  if (error) return <Card className="bg-card"><CardContent className="py-8 text-center text-muted-foreground">Error al cargar</CardContent></Card>;
  if (!allCVs.length) return (
    <Card className="bg-card">
      <CardContent className="py-12 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-foreground">Sin CVs</h3>
        <p className="text-muted-foreground mb-4">Subí tu primer CV para empezar</p>
        <CVUploadDialog trigger={
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            Subir CV
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
            Mostrando {allCVs.length} de {data?.pagination?.total || 0} CVs (página {page} de {totalPages})
          </p>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="border-border text-foreground hover:bg-secondary"
          >
            {isFetching ? 'Cargando...' : 'Cargar más'}
          </Button>
        </div>
      )}
    </div>
  );
}

