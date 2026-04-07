'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, Search, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import apiClient from '@/lib/api';
import type { CV } from '@/lib/types';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from 'sonner';
import Link from 'next/link';
import { useState } from 'react';

function CommunityCard({ cv }: { cv: CV }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const voteMutation = useMutation({ mutationFn: async () => { if (cv.hasVoted) await apiClient.delete(`/community/cvs/${cv.id}/vote`); else await apiClient.post(`/community/cvs/${cv.id}/vote`); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['community-cvs'] }); toast.success(cv.hasVoted ? 'Voto eliminado' : '¡Votado!'); }, onError: () => toast.error('Error') });
  const initials = cv.user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className="hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarFallback>{initials || <User className="h-5 w-5" />}</AvatarFallback></Avatar><div><CardTitle className="text-lg">{cv.user?.name}</CardTitle><CardDescription>{cv.targetJob && <span>{cv.targetJob}</span>}{cv.targetJob && cv.targetIndustry && <span> · </span>}{cv.targetIndustry && <span>{cv.targetIndustry}</span>}</CardDescription></div></div>
          <Badge variant="secondary">{cv.analysisResult?.score || 0}/100</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><ThumbsUp className="h-4 w-4" /><span>{cv.upvotes} votos</span></div>
          <div className="flex gap-2">
            {isAuthenticated && <Button variant={cv.hasVoted ? 'default' : 'outline'} size="sm" onClick={() => voteMutation.mutate()} disabled={voteMutation.isPending}><ThumbsUp className={`h-4 w-4 mr-1 ${cv.hasVoted ? 'fill-current' : ''}`} />{cv.hasVoted ? 'Votado' : 'Votar'}</Button>}
            <Button variant="outline" size="sm" asChild><a href={cv.improvedPdfUrl} target="_blank">Ver CV</a></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: cvs, isLoading } = useQuery({ queryKey: ['community-cvs'], queryFn: async () => { const r = await apiClient.get(`/community/cvs?${new URLSearchParams(searchTerm ? { targetJob: searchTerm } : {})}`); return r.data.data as CV[]; } });
  const { data: topCVs } = useQuery({ queryKey: ['top-cvs'], queryFn: async () => { const r = await apiClient.get('/community/top'); return r.data.data as CV[]; } });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b"><div className="container mx-auto px-4 h-16 flex items-center justify-between"><Link href="/dashboard" className="font-bold text-xl">CVMaster</Link><nav className="flex items-center gap-4"><Button variant="ghost" asChild><Link href="/dashboard">Mi Dashboard</Link></Button></nav></div></header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Comunidad</h1><p className="text-muted-foreground">Descubre los mejores CVs</p></div>
        <Tabs defaultValue="explore" className="space-y-6">
          <TabsList><TabsTrigger value="explore">Explorar</TabsTrigger><TabsTrigger value="top">Top CVs</TabsTrigger></TabsList>
          <TabsContent value="explore">
            <div className="relative mb-6"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
            {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48" />)}</div> : !cvs?.length ? <Card><CardContent className="py-12 text-center">No hay CVs públicos</CardContent></Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{cvs.map((cv) => <CommunityCard key={cv.id} cv={cv} />)}</div>}
          </TabsContent>
          <TabsContent value="top">
            {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}</div> : !topCVs?.length ? <Card><CardContent className="py-12 text-center">No hay CVs votados</CardContent></Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{topCVs.map((cv) => <CommunityCard key={cv.id} cv={cv} />)}</div>}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
