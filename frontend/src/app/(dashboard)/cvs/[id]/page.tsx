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

  if (isLoading) return <div className="min-h-screen bg-black"><DashboardHeader /><main className="container mx-auto px-4 py-8"><Skeleton className="h-48 bg-white/5" /></main></div>;

  if (!cv) return <div className="min-h-screen bg-black"><DashboardHeader /><main className="container mx-auto px-4 py-8"><Card className="glass-card"><CardContent className="py-12 text-center text-gray-400">Error</CardContent></Card></main></div>;

  const statusConfig = { PROCESSING: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', text: 'Procesando...' }, COMPLETED: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', text: 'Completado' }, FAILED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', text: 'Fallido' } };
  const status = statusConfig[cv.status];

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <a href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"><ArrowLeft className="mr-2 h-4 w-4" />Volver</a>
        <div className="flex items-start justify-between mb-8">
          <div><h1 className="text-3xl font-bold mb-2 text-white">{cv.title}</h1><div className="flex items-center gap-4 text-gray-400">{cv.targetJob && <span>{cv.targetJob}</span>}{cv.targetIndustry && <span>· {cv.targetIndustry}</span>}<span className={`flex items-center gap-1 ${status.color}`}><status.icon className="h-4 w-4" />{status.text}</span></div></div>
          <div className="flex gap-2">
            <a href={cv.originalPdfUrl} target="_blank" className="inline-flex items-center px-3 py-2 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"><FileText className="mr-2 h-4 w-4" />Original</a>
            {cv.improvedPdfUrl && <a href={cv.improvedPdfUrl} target="_blank" className="inline-flex items-center px-3 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-gray-200 shadow-lg shadow-white/10 transition-all"><Download className="mr-2 h-4 w-4" />Mejorado</a>}
          </div>
        </div>
        {cv.status === 'PROCESSING' && <Card className="glass-card"><CardContent className="py-12 text-center"><div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${status.bg} mb-4`}><Clock className={`h-8 w-8 ${status.color}`} /></div><h2 className="text-xl font-semibold mb-2 text-white">Procesando</h2><p className="text-gray-400">La IA está analizando tu CV...</p><Progress value={66} className="max-w-md mx-auto mt-4" /></CardContent></Card>}
        {cv.status === 'COMPLETED' && cv.analysisResult && (
          <Tabs defaultValue="analysis" className="space-y-6">
            <TabsList className="bg-black/40 border border-white/10"><TabsTrigger value="analysis" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">Análisis</TabsTrigger><TabsTrigger value="suggestions" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">Sugerencias</TabsTrigger></TabsList>
            <TabsContent value="analysis"><Card className="glass-card"><CardHeader><CardTitle className="text-white">Puntuación ATS</CardTitle><CardDescription className="text-gray-400">Qué tan bien está optimizado</CardDescription></CardHeader><CardContent><div className="flex items-center gap-4"><div className={`text-6xl font-bold ${cv.analysisResult.score >= 70 ? 'text-green-400' : cv.analysisResult.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{cv.analysisResult.score}</div><div className="flex-1"><Progress value={cv.analysisResult.score} className="h-4" /></div></div>{cv.analysisResult.missingKeywords.length > 0 && <div className="mt-4"><h3 className="font-semibold mb-2 text-white">Keywords faltantes</h3><div className="flex flex-wrap gap-2">{cv.analysisResult.missingKeywords.map((kw, i) => <Badge key={i} variant="outline" className="border-white/20 text-white">{kw}</Badge>)}</div></div>}</CardContent></Card></TabsContent>
            <TabsContent value="suggestions"><Card className="glass-card"><CardHeader><CardTitle className="text-white">Sugerencias</CardTitle></CardHeader><CardContent><div className="space-y-4">{cv.analysisResult.issues.map((issue, i) => <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"><XCircle className="h-5 w-5 text-red-400 mt-0.5" /><span className="text-gray-300">{issue}</span></div>)}{cv.analysisResult.suggestions.map((s, i) => <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"><CheckCircle className="h-5 w-5 text-green-400 mt-0.5" /><span className="text-gray-300">{s}</span></div>)}</div></CardContent></Card></TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
