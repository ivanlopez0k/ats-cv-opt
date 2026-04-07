'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, CheckCircle, XCircle, MoreVertical, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import apiClient from '@/lib/api';
import type { CV } from '@/lib/types';

function CVCardSkeleton() {
  return <Card className="glass-card"><CardHeader><Skeleton className="h-6 w-48 bg-white/10" /><Skeleton className="h-4 w-32 mt-2 bg-white/10" /></CardHeader><CardContent><Skeleton className="h-4 w-full bg-white/10" /></CardContent></Card>;
}

function CVCard({ cv }: { cv: CV }) {
  const statusConfig = { PROCESSING: { icon: Clock, variant: 'secondary' as const, text: 'Procesando' }, COMPLETED: { icon: CheckCircle, variant: 'default' as const, text: 'Listo' }, FAILED: { icon: XCircle, variant: 'destructive' as const, text: 'Fallido' } };
  const status = statusConfig[cv.status];

  return (
    <Card className="glass-card hover:shadow-lg hover:shadow-white/5 transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg text-white">{cv.title}</CardTitle>
            <CardDescription className="text-gray-400">{cv.targetJob && <span>{cv.targetJob}</span>}{cv.targetJob && cv.targetIndustry && <span> · </span>}{cv.targetIndustry && <span>{cv.targetIndustry}</span>}</CardDescription>
          </div>
          <Badge variant={status.variant} className="flex items-center gap-1 bg-white/10 text-white border-white/10"><status.icon className="h-3 w-3" />{status.text}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {cv.isPublic ? <span className="flex items-center gap-1"><Globe className="h-4 w-4" />Público</span> : <span className="flex items-center gap-1"><Lock className="h-4 w-4" />Privado</span>}
            {cv.upvotes > 0 && <span>{cv.upvotes} votos</span>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger><Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/80 backdrop-blur-xl border-white/10" align="end">
              <DropdownMenuItem><a href={`/dashboard/cvs/${cv.id}`} className="flex items-center text-white"><FileText className="mr-2 h-4 w-4" />Ver</a></DropdownMenuItem>
              <DropdownMenuItem><a href={cv.originalPdfUrl} target="_blank" className="text-white">PDF original</a></DropdownMenuItem>
              {cv.improvedPdfUrl && <DropdownMenuItem><a href={cv.improvedPdfUrl} target="_blank" className="text-white">PDF mejorado</a></DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {cv.analysisResult && cv.status === 'COMPLETED' && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <span className="text-sm text-gray-400">Score ATS: </span>
            <span className={`font-semibold ${cv.analysisResult.score >= 70 ? 'text-green-400' : cv.analysisResult.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{cv.analysisResult.score}/100</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CVList() {
  const { data, isLoading, error } = useQuery({ queryKey: ['cvs'], queryFn: async () => { const response = await apiClient.get('/cvs'); return response.data.data as CV[]; } });

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <CVCardSkeleton key={i} />)}</div>;
  if (error) return <Card className="glass-card"><CardContent className="py-8 text-center text-gray-400">Error al cargar</CardContent></Card>;
  if (!data?.length) return <Card className="glass-card"><CardContent className="py-12 text-center"><FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" /><h3 className="text-lg font-medium mb-2 text-white">Sin CVs</h3><a href="/dashboard/cvs/new" className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-gray-200 transition-all">Subir CV</a></CardContent></Card>;

  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{data.map((cv) => <CVCard key={cv.id} cv={cv} />)}</div>;
}
