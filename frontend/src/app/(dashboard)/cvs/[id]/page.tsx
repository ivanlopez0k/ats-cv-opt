'use client';
import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, FileText, Download, ArrowLeft, Globe, Lock } from 'lucide-react';
import Link from 'next/link';
import { CVPreview } from '@/components/features/cv/CVPreview';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { CV } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/authStore';

export default function CVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

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
      toast.success(cv?.isPublic ? 'CV vuelto privado' : 'CV compartido con la comunidad');
    },
    onError: () => toast.error('Error al actualizar'),
  });

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
            <CardContent className="py-12 text-center text-muted-foreground">CV no encontrado</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const statusConfig = {
    PROCESSING: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', text: 'Procesando...' },
    COMPLETED: { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', text: 'Completado' },
    FAILED: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', text: 'Fallido' },
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
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
                  <><Lock className="mr-1 h-3 w-3" /> Volver privado</>
                ) : (
                  <><Globe className="mr-1 h-3 w-3" /> Compartir</>
                )}
              </Button>
            )}
            <a
              href={cv.originalPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-foreground border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <FileText className="mr-2 h-4 w-4" /> Original
            </a>
            {improvedPdfUrl && (
              <a
                href={improvedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-background bg-foreground rounded-lg hover:bg-foreground/90 shadow-lg transition-all"
              >
                <Download className="mr-2 h-4 w-4" /> Mejorado
              </a>
            )}
          </div>
        </div>

        {/* Processing state */}
        {cv.status === 'PROCESSING' && (
          <Card className="bg-card">
            <CardContent className="py-12 text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${status.bg} mb-4`}>
                <Clock className={`h-8 w-8 ${status.color}`} />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">Procesando</h2>
              <p className="text-muted-foreground">La IA está analizando y optimizando tu CV...</p>
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
                  Contexto
                </TabsTrigger>
                <TabsTrigger value="analysis" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
                  Análisis ATS
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
                  Sugerencias
                </TabsTrigger>
              </TabsList>

              {/* Context tab */}
              <TabsContent value="context">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Contexto de la IA</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Respuestas que usó la IA para optimizar tu CV
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(cv as any).contextAnswers ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries((cv as any).contextAnswers).map(([key, value]) => {
                          if (!value || key === 'targetJob' || key === 'targetIndustry') return null;
                          const labels: Record<string, string> = {
                            targetCompany: 'Empresa objetivo',
                            experienceLevel: 'Nivel de experiencia',
                            optimizationFocus: 'Enfoque de optimización',
                            additionalNotes: 'Notas adicionales',
                          };
                          const levelLabels: Record<string, string> = {
                            junior: 'Junior / Trainee',
                            mid: 'Semi-Senior',
                            senior: 'Senior',
                            lead: 'Lead / Manager',
                          };
                          const focusLabels: Record<string, string> = {
                            technical: 'Experiencia técnica',
                            soft: 'Habilidades blandas',
                            both: 'Ambas',
                            'career-change': 'Cambio de carrera',
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
                      <p className="text-muted-foreground">No se proporcionó contexto adicional para este CV.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis tab */}
              <TabsContent value="analysis">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Puntuación ATS</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Qué tan bien está optimizado tu CV para sistemas ATS
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
                        <h3 className="font-semibold mb-2 text-foreground">Keywords faltantes</h3>
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
                    <CardTitle className="text-foreground">Sugerencias de mejora</CardTitle>
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
              <h2 className="text-xl font-semibold mb-2 text-foreground">Error al procesar</h2>
              <p className="text-muted-foreground">
                {(cv.analysisResult as any)?.error || 'Ocurrió un error al procesar tu CV'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
