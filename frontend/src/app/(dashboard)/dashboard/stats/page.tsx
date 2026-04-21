'use client';
import { useQuery } from '@tanstack/react-query';
import { FileText, CheckCircle, XCircle, Clock, Globe, Lock, TrendingUp, ThumbsUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/lib/stores/authStore';
import { useI18n } from '@/i18n';

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

export default function StatsPage() {
  const { user } = useAuthStore();
  const { t } = useI18n();

  const statCards = [
    { key: 'total', label: t('dashboard.stats.cards.total'), icon: FileText, color: 'text-blue-500' },
    { key: 'completed', label: t('dashboard.stats.cards.completed'), icon: CheckCircle, color: 'text-emerald-500' },
    { key: 'processing', label: t('dashboard.stats.cards.processing'), icon: Clock, color: 'text-yellow-500' },
    { key: 'failed', label: t('dashboard.stats.cards.failed'), icon: XCircle, color: 'text-red-500' },
    { key: 'publicCount', label: t('dashboard.stats.cards.publicCount'), icon: Globe, color: 'text-purple-500' },
    { key: 'privateCount', label: t('dashboard.stats.cards.privateCount'), icon: Lock, color: 'text-gray-500' },
    { key: 'avgScore', label: t('dashboard.stats.cards.avgScore'), icon: TrendingUp, color: 'text-orange-500', suffix: t('dashboard.stats.cards.suffix') },
    { key: 'totalVotes', label: t('dashboard.stats.cards.totalVotes'), icon: ThumbsUp, color: 'text-pink-500' },
  ];

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
        <h1 className="text-3xl font-bold mb-2 text-foreground">{t('dashboard.stats.title')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('dashboard.stats.subtitle')}
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
                {t('dashboard.stats.latestCv')}
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