'use client';
import { useQuery } from '@tanstack/react-query';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, FileText, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import type { CV } from '@/lib/types';

export default function CVDetailPage({ params }: { params: { id: string } }) {
  const { data: cv, isLoading } = useQuery({ queryKey: ['cv', params.id], queryFn: async () => { const r = await apiClient.get(`/cvs/${params.id}`); return r.data.data as CV; } });

  if (isLoading) return <div className="min-h-screen bg-slate-50"><DashboardHeader /><main className="container mx-auto px-4 py-8"><Skeleton className="h-48" /></main></div>;

  if (!cv) return <div className="min-h-screen bg-slate-50"><DashboardHeader /><main className="container mx-auto px-4 py-8"><Card><CardContent className="py-12 text-center">Error</CardContent></Card></main></div>;

  const statusConfig = { PROCESSING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Procesando...' }, COMPLETED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Completado' }, FAILED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Fallido' } };
  const status = statusConfig[cv.status];

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6"><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Link></Button>
        <div className="flex items-start justify-between mb-8">
          <div><h1 className="text-3xl font-bold mb-2">{cv.title}</h1><div className="flex items-center gap-4 text-muted-foreground">{cv.targetJob && <span>{cv.targetJob}</span>}{cv.targetIndustry && <span>· {cv.targetIndustry}</span>}<span className={`flex items-center gap-1 ${status.color}`}><status.icon className="h-4 w-4" />{status.text}</span></div></div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><a href={cv.originalPdfUrl} target="_blank"><FileText className="mr-2 h-4 w-4" />Original</a></Button>
            {cv.improvedPdfUrl && <Button asChild><a href={cv.improvedPdfUrl} target="_blank"><Download className="mr-2 h-4 w-4" />Mejorado</a></Button>}
          </div>
        </div>
        {cv.status === 'PROCESSING' && <Card><CardContent className="py-12 text-center"><div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${status.bg} mb-4`}><Clock className={`h-8 w-8 ${status.color}`} /></div><h2 className="text-xl font-semibold mb-2">Procesando</h2><p className="text-muted-foreground">La IA está analizando tu CV...</p><Progress value={66} className="max-w-md mx-auto mt-4" /></CardContent></Card>}
        {cv.status === 'COMPLETED' && cv.analysisResult && (
          <Tabs defaultValue="analysis" className="space-y-6">
            <TabsList><TabsTrigger value="analysis">Análisis</TabsTrigger><TabsTrigger value="suggestions">Sugerencias</TabsTrigger></TabsList>
            <TabsContent value="analysis"><Card><CardHeader><CardTitle>Puntuación ATS</CardTitle><CardDescription>Qué tan bien está optimizado</CardDescription></CardHeader><CardContent><div className="flex items-center gap-4"><div className={`text-6xl font-bold ${cv.analysisResult.score >= 70 ? 'text-green-600' : cv.analysisResult.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>{cv.analysisResult.score}</div><div className="flex-1"><Progress value={cv.analysisResult.score} className="h-4" /></div></div>{cv.analysisResult.missingKeywords.length > 0 && <div className="mt-4"><h3 className="font-semibold mb-2">Keywords faltantes</h3><div className="flex flex-wrap gap-2">{cv.analysisResult.missingKeywords.map((kw, i) => <Badge key={i} variant="outline">{kw}</Badge>)}</div></div>}</CardContent></Card></TabsContent>
            <TabsContent value="suggestions"><Card><CardHeader><CardTitle>Sugerencias</CardTitle></CardHeader><CardContent><div className="space-y-4">{cv.analysisResult.issues.map((issue, i) => <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-50"><XCircle className="h-5 w-5 text-red-600 mt-0.5" /><span>{issue}</span></div>)}{cv.analysisResult.suggestions.map((s, i) => <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-50"><CheckCircle className="h-5 w-5 text-green-600 mt-0.5" /><span>{s}</span></div>)}</div></CardContent></Card></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
