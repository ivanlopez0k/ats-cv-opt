'use client';
import { useQuery } from '@tanstack/react-query';
import { FileText, CheckCircle, XCircle, Clock, Globe, Lock, TrendingUp, ThumbsUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';

interface Stats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  publicCount: number;
  privateCount: number;
  avgScore: number;
  totalVotes: number;
  latestCVDate: string | null;
}

const statCards: Array<{key: string; label: string; icon: React.ElementType; color: string; suffix?: string}> = [
  { key: 'total', label: 'Total CVs', icon: FileText, color: 'text-blue-500' },
  { key: 'completed', label: 'Completados', icon: CheckCircle, color: 'text-emerald-500' },
  { key: 'processing', label: 'En proceso', icon: Clock, color: 'text-yellow-500' },
  { key: 'failed', label: 'Fallidos', icon: XCircle, color: 'text-red-500' },
  { key: 'publicCount', label: 'Públicos', icon: Globe, color: 'text-purple-500' },
  { key: 'privateCount', label: 'Privados', icon: Lock, color: 'text-gray-500' },
  { key: 'avgScore', label: 'Score promedio', icon: TrendingUp, color: 'text-orange-500', suffix: 'pts' },
  { key: 'totalVotes', label: 'Votos recibidos', icon: ThumbsUp, color: 'text-pink-500' },
];

export default function StatsPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['cv-stats'],
    queryFn: async () => {
      const r = await apiClient.get('/cvs/stats');
      return r.data.data as Stats;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const stats = data as Stats | undefined;

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Mis Estadísticas</h1>
        <p className="text-muted-foreground mb-8">
          Resumen de tu actividad en CVMaster
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const value = (stats as any)?.[stat.key] ?? 0;
            const displayValue = stat.suffix ? `${value}${stat.suffix}` : value;

            return (
              <Card key={stat.key} className="bg-card">
                <CardHeader className="pb-2">
                  <CardDescription className="text-sm">{stat.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {displayValue}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Latest CV */}
        {stats?.latestCVDate && (
          <Card className="mt-6 bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                último CV subido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {new Date(stats.latestCVDate).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}