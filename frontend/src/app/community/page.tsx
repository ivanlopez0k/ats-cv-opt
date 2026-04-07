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
    <Card className="glass-card hover:shadow-lg hover:shadow-white/5 transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarFallback className="bg-white/10 text-white">{initials || <User className="h-5 w-5" />}</AvatarFallback></Avatar><div><CardTitle className="text-lg text-white">{cv.user?.name}</CardTitle><CardDescription className="text-gray-400">{cv.targetJob && <span>{cv.targetJob}</span>}{cv.targetJob && cv.targetIndustry && <span> · </span>}{cv.targetIndustry && <span>{cv.targetIndustry}</span>}</CardDescription></div></div>
          <Badge variant="secondary" className="bg-white/10 text-white border-white/10">{cv.analysisResult?.score || 0}/100</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400"><ThumbsUp className="h-4 w-4" /><span>{cv.upvotes} votos</span></div>
          <div className="flex gap-2">
            {isAuthenticated && <Button variant={cv.hasVoted ? 'default' : 'outline'} size="sm" onClick={() => voteMutation.mutate()} disabled={voteMutation.isPending} className={cv.hasVoted ? 'bg-white text-black hover:bg-gray-200' : 'border-white/20 text-white hover:bg-white/10'}><ThumbsUp className={`h-4 w-4 mr-1 ${cv.hasVoted ? 'fill-current' : ''}`} />{cv.hasVoted ? 'Votado' : 'Votar'}</Button>}
            <a href={cv.improvedPdfUrl} target="_blank" className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors">Ver CV</a>
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
    <div className="min-h-screen bg-black">
      <header className="bg-black/50 backdrop-blur-md border-b border-white/10 glass-header"><div className="container mx-auto px-4 h-16 flex items-center justify-between"><Link href="/dashboard" className="font-bold text-xl text-white">CVMaster</Link><nav className="flex items-center gap-4"><Link href="/dashboard" className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg hover:bg-white/10 transition-colors">Mi Dashboard</Link></nav></div></header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold mb-2 text-white">Comunidad</h1><p className="text-gray-400">Descubre los mejores CVs</p></div>
        <Tabs defaultValue="explore" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10"><TabsTrigger value="explore" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">Explorar</TabsTrigger><TabsTrigger value="top" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">Top CVs</TabsTrigger></TabsList>
          <TabsContent value="explore">
            <div className="relative mb-6"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" /><Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-gray-500" /></div>
            {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 bg-white/5" />)}</div> : !cvs?.length ? <Card className="glass-card"><CardContent className="py-12 text-center text-gray-400">No hay CVs públicos</CardContent></Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{cvs.map((cv) => <CommunityCard key={cv.id} cv={cv} />)}</div>}
          </TabsContent>
          <TabsContent value="top">
            {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 bg-white/5" />)}</div> : !topCVs?.length ? <Card className="glass-card"><CardContent className="py-12 text-center text-gray-400">No hay CVs votados</CardContent></Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{topCVs.map((cv) => <CommunityCard key={cv.id} cv={cv} />)}</div>}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
