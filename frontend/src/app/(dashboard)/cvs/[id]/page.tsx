'use client';
import { useState, useEffect, useRef } from 'react';
import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, CheckCircle, XCircle, FileText, Download, ArrowLeft, Globe, Lock, Trash2, AlertTriangle, Sparkles, RefreshCw, FileDown } from 'lucide-react';
import Link from 'next/link';
import { CVPreview } from '@/components/features/cv/CVPreview';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { CV } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/authStore';
import { useI18n } from '@/i18n';

export default function CVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: cv, isLoading } = useQuery({
    queryKey: ['cv', id],
    queryFn: async () => {
      const r = await apiClient.get(`/cvs/${id}`);
      return r.data.data as CV;
    },
  });

  const togglePublicMutation = useMutation({
    mutationFn: async () => {
      return apiClient.patch(`/cvs/${id}`, { isPublic: !cv?.isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv', id] });
      toast.success(cv?.isPublic ? t('cvDetail.toasts.madePrivate') : t('cvDetail.toasts.shared'));
    },
    onError: () => toast.error(t('cvDetail.toasts.updateError')),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/cvs/${id}`);
    },
    onSuccess: () => {
      toast.success(t('cvDetail.toasts.deleted'));
      router.push('/dashboard');
    },
    onError: () => toast.error(t('cvDetail.toasts.deleteError')),
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post('/ai/reanalyze', { cvId: id });
    },
    onSuccess: () => {
      // Optimistically set CV to processing for immediate UI feedback
      queryClient.setQueryData(['cv', id], (old: CV | undefined) => {
        if (!old) return old;
        return { ...old, status: 'PROCESSING' as const };
      });
      // Also invalidate to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['cv', id] });
      toast.success(t('cvDetail.toasts.reanalyzeStarted'));
    },
    onError: () => toast.error(t('cvDetail.toasts.reanalyzeError')),
  });

  // SSE for real-time updates when CV is processing
  const eventSourceRef = useRef<EventSource | null>(null);

  console.log('🔍 CV status:', cv?.status); // Debug log

  useEffect(() => {
    // Debug: log the status
    console.log('🔍 SSE effect running, CV status:', cv?.status);

    // Only connect if CV is processing
    if (cv?.status !== 'PROCESSING') {
      console.log('⏭️ Skipping SSE - CV not processing');
      return;
    }

    // Wait for auth to be ready
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Retry after small delay for auth to initialize
      const timer = setTimeout(() => {
        const retryToken = localStorage.getItem('accessToken');
        if (retryToken) {
          // Trigger re-run of this effect
          queryClient.invalidateQueries({ queryKey: ['cv', id] });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    const connectSSE = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const sseUrl = `${apiUrl}/sse/cv/${id}?token=${encodeURIComponent(token)}`;
      console.log('📡 Creating EventSource:', sseUrl);

      try {
        const eventSource = new EventSource(sseUrl, {
          withCredentials: true,
        });

      eventSource.addEventListener('cv-status', (event) => {
        const data = JSON.parse(event.data);
        queryClient.setQueryData(['cv', id], (old: CV | undefined) => {
          if (!old) return old;
          return {
            ...old,
            status: data.status,
            analysisResult: data.analysisResult,
            improvedPdfUrl: data.improvedPdfUrl,
            improvedJson: data.improvedJson,
          };
        });

        // Show toast based on status
        if (data.status === 'COMPLETED') {
          toast.success(t('cvDetail.toasts.cvReady'));
        } else if (data.status === 'FAILED') {
          toast.error(data.message || t('cvDetail.toasts.processingError'));
        }
      });

      eventSource.addEventListener('connected', () => {
        console.log('📡 SSE: Connected to event stream');
      });

      eventSource.onerror = (e) => {
        console.error('SSE error:', e);
      };

      eventSource.onmessage = (e) => {
        console.log('📨 SSE message received:', e.data);
      };

      eventSourceRef.current = eventSource;
      } catch (err) {
        console.error('❌ Failed to create EventSource:', err);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [cv?.status, id, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-48 bg-muted" />
        </main>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="bg-card">
            <CardContent className="py-12 text-center text-muted-foreground">{t('cvDetail.notFound')}</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const statusConfig = {
    PROCESSING: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', text: t('cvDetail.processing') },
    COMPLETED: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', text: t('cvDetail.completed') },
    FAILED: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', text: t('cvDetail.failed') },
  };
  const status = statusConfig[cv.status as keyof typeof statusConfig];

  // Extract HTML URL from improvedJson
  const improvedHtmlUrl = (cv as any).improvedJson?.htmlUrl;
  const improvedPdfUrl = cv.improvedPdfUrl;

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('cvDetail.back')}
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">{cv.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              {cv.targetJob && <span>{cv.targetJob}</span>}
              {cv.targetIndustry && <span>· {cv.targetIndustry}</span>}
              <span className={`flex items-center gap-1 ${status.color}`}>
                <status.icon className="h-4 w-4" />
                {status.text}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {cv.status === 'COMPLETED' && (
              <Button
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-secondary"
                onClick={() => togglePublicMutation.mutate()}
                disabled={togglePublicMutation.isPending}
              >
                {cv.isPublic ? (
                  <><Lock className="mr-1 h-3 w-3" /> {t('cvDetail.makePrivate')}</>
                ) : (
                  <><Globe className="mr-1 h-3 w-3" /> {t('cvDetail.share')}</>
                )}
              </Button>
            )}
            <a
              href={cv.originalPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-foreground border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <FileText className="mr-2 h-4 w-4" /> {t('cvDetail.original')}
            </a>
            {improvedPdfUrl && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/cvs/${cv.id}/export?format=pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition-colors bg-foreground text-background hover:bg-foreground/90"
              >
                <Download className="mr-2 h-4 w-4" /> {t('cvDetail.downloadPdf')}
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteMutation.isPending}
              aria-label="Eliminar CV"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Re-analyze button for completed CVs */}
        {cv.status === 'COMPLETED' && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              className="border-foreground/20 text-foreground hover:bg-secondary"
              onClick={() => reanalyzeMutation.mutate()}
              disabled={reanalyzeMutation.isPending}
            >
              {reanalyzeMutation.isPending ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{t('cvDetail.reanalizing')}</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />{t('cvDetail.reanalyze')}</>
              )}
            </Button>
          </div>
        )}

        {/* Processing state */}
        {cv.status === 'PROCESSING' && (
          <Card className="bg-card">
            <CardContent className="py-12 text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${status.bg} mb-4`}>
                <Clock className={`h-8 w-8 ${status.color}`} />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">{t('cvDetail.processing')}</h2>
              <p className="text-muted-foreground">{t('cvDetail.processingCv')}</p>
              <Progress value={66} className="max-w-md mx-auto mt-4" />
            </CardContent>
          </Card>
        )}

        {/* Completed state */}
        {cv.status === 'COMPLETED' && cv.analysisResult && (
          <div className="space-y-6">
            {/* Preview section */}
            {improvedHtmlUrl && user && (
              <CVPreview
                cvId={cv.id}
                userId={user.id}
                improvedHtmlUrl={improvedHtmlUrl}
                improvedPdfUrl={improvedPdfUrl}
              />
            )}

            {/* Analysis tabs */}
            <Tabs defaultValue="analysis" className="space-y-6">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="context" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
                  {t('cvDetail.tabs.context')}
                </TabsTrigger>
                <TabsTrigger value="analysis" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
                  {t('cvDetail.tabs.analysis')}
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
                  {t('cvDetail.tabs.suggestions')}
                </TabsTrigger>
              </TabsList>

              {/* Context tab */}
              <TabsContent value="context">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">{t('cvDetail.contextTitle')}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {t('cvDetail.contextDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(cv as any).contextAnswers ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries((cv as any).contextAnswers).map(([key, value]) => {
                          if (!value || key === 'targetJob' || key === 'targetIndustry') return null;
                          const labels: Record<string, string> = {
                            targetCompany: t('cvDetail.labels.targetCompany'),
                            experienceLevel: t('cvDetail.labels.experienceLevel'),
                            optimizationFocus: t('cvDetail.labels.optimizationFocus'),
                            additionalNotes: t('cvDetail.labels.additionalNotes'),
                          };
                          const levelLabels: Record<string, string> = {
                            junior: t('cvDetail.levels.junior'),
                            mid: t('cvDetail.levels.mid'),
                            senior: t('cvDetail.levels.senior'),
                            lead: t('cvDetail.levels.lead'),
                          };
                          const focusLabels: Record<string, string> = {
                            technical: t('cvDetail.focuses.technical'),
                            soft: t('cvDetail.focuses.soft'),
                            both: t('cvDetail.focuses.both'),
                            'career-change': t('cvDetail.focuses.careerChange'),
                          };
                          let displayValue = value as string;
                          if (key === 'experienceLevel') displayValue = levelLabels[displayValue] || displayValue;
                          if (key === 'optimizationFocus') displayValue = focusLabels[displayValue] || displayValue;
                          return (
                            <div key={key} className="p-3 rounded-lg bg-muted/50 border border-border">
                              <p className="text-xs text-muted-foreground/70 uppercase tracking-wider mb-1">
                                {labels[key] || key}
                              </p>
                              <p className="text-foreground">{displayValue}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">{t('cvDetail.noContext')}</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis tab */}
              <TabsContent value="analysis">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">{t('cvDetail.atsScore')}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {t('cvDetail.atsScoreDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-6xl font-bold ${
                          cv.analysisResult.score >= 70
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : cv.analysisResult.score >= 40
                            ? 'text-yellow-500'
                            : 'text-destructive'
                        }`}
                      >
                        {cv.analysisResult.score}
                      </div>
                      <div className="flex-1">
                        <Progress value={cv.analysisResult.score} className="h-4" />
                      </div>
                    </div>
                    {cv.analysisResult.missingKeywords.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2 text-foreground">{t('cvDetail.missingKeywords')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {cv.analysisResult.missingKeywords.map((kw, i) => (
                            <Badge key={i} variant="outline" className="border-border text-foreground">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Suggestions tab */}
              <TabsContent value="suggestions">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">{t('cvDetail.suggestionsTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cv.analysisResult.issues.map((issue, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                        >
                          <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                          <span className="text-foreground/80">{issue}</span>
                        </div>
                      ))}
                      {cv.analysisResult.suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                        >
                          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                          <span className="text-foreground/80">{s}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Failed state */}
        {cv.status === 'FAILED' && (
          <Card className="bg-card">
            <CardContent className="py-12 text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${status.bg} mb-4`}>
                <XCircle className={`h-8 w-8 ${status.color}`} />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">{t('cvDetail.errorProcessing')}</h2>
              <p className="text-muted-foreground mb-4">
                {(cv.analysisResult as any)?.error || t('cvDetail.errorMessage')}
              </p>
              <Button
                variant="default"
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/90"
                onClick={() => reanalyzeMutation.mutate()}
                disabled={reanalyzeMutation.isPending}
              >
                {reanalyzeMutation.isPending ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{t('cvDetail.retrying')}</>
                ) : (
                  <><RefreshCw className="mr-2 h-4 w-4" />{t('cvDetail.retry')}</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t('cvDetail.deleteCv')}
              </DialogTitle>
              <DialogDescription>
                {t('cvDetail.deleteConfirm')} <strong>"{cv.title}"</strong>{t('cvDetail.deleteConfirmEnd')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteMutation.isPending}
              >
                {t('cvDetail.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t('cvDetail.deleting') : t('cvDetail.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
