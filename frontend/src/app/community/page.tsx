'use client';
import { useEffect, useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, Search, User, ChevronLeft, ChevronRight, FileText, Loader2, X } from 'lucide-react';
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
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { useI18n } from '@/i18n';

const PAGE_SIZE = 9;

const INDUSTRY_FILTERS = [
  'Tecnología',
  'Marketing',
  'Diseño',
  'Ventas',
  'Finanzas',
  'Salud',
  'Educación',
  'Ingeniería',
];

const JOB_FILTERS = [
  'Frontend',
  'Backend',
  'Full Stack',
  'Data',
  'DevOps',
  'Mobile',
  'QA',
  'Product',
];

const SCORE_FILTERS = [
  { label: '90+', value: '90' as const },
  { label: '70-89', value: '70' as const },
  { label: '<70', value: 'low' as const },
];

function CVPreviewThumbnail({ htmlUrl }: { htmlUrl: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(htmlUrl)
      .then((res) => res.text())
      .then((html) => {
        if (!cancelled) { setContent(html); setLoading(false); }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [htmlUrl]);

  if (loading) {
    return <div className="h-48 bg-muted animate-pulse rounded-t-none" />;
  }

  if (!content) {
    return null;
  }

  return (
    <div className="relative h-48 overflow-hidden border-t border-border">
      <div
        className="origin-top-left"
        style={{ transform: 'scale(0.35)', width: '285.7%', height: '285.7%' }}
      >
        <iframe
          srcDoc={content}
          className="w-full h-[800px] border-0"
          title="CV Preview"
          sandbox="allow-same-origin allow-scripts"
          style={{ pointerEvents: 'none' }}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
    </div>
  );
}

function CommunityCard({ cv }: { cv: CV }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const voteMutation = useMutation({
    mutationFn: async () => {
      if (cv.hasVoted) await apiClient.delete(`/community/cvs/${cv.id}/vote`);
      else await apiClient.post(`/community/cvs/${cv.id}/vote`);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['community-cvs'] });
      if (cv.hasVoted) toast.success(t('community.card.toast.voteRemoved'));
      else toast.success(t('community.card.toast.voted'));
    },
    onError: (e: any) => toast.error(e.response?.data?.error || t('community.card.toast.error')),
  });
  const initials = cv.user?.username?.slice(0, 2).toUpperCase() || cv.user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const improvedHtmlUrl = (cv as any).improvedJson?.htmlUrl;

  return (
    <Card className="bg-card hover:shadow-lg transition-all overflow-hidden">
      <CardHeader className="pb-3">
        <Link href={`/cvs/${cv.id}`} className="block">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarFallback className="bg-secondary text-foreground">{initials || <User className="h-5 w-5" />}</AvatarFallback></Avatar><div><CardTitle className="text-lg text-foreground">{cv.user?.name}</CardTitle><CardDescription className="text-muted-foreground">{cv.targetJob && <span>{cv.targetJob}</span>}{cv.targetJob && cv.targetIndustry && <span> · </span>}{cv.targetIndustry && <span>{cv.targetIndustry}</span>}</CardDescription></div></div>
            <Badge variant="secondary" className="bg-secondary text-foreground border-border">{cv.analysisResult?.score || 0}/100</Badge>
          </div>
        </Link>
      </CardHeader>

      {/* CV Mini Preview */}
      {improvedHtmlUrl && <CVPreviewThumbnail htmlUrl={improvedHtmlUrl} />}

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><ThumbsUp className="h-4 w-4" /><span>{cv.upvotes} {t('community.card.votes')}</span></div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <Button
                size="sm"
                onClick={() => voteMutation.mutate()}
                disabled={voteMutation.isPending}
                className={cv.hasVoted
                  ? 'bg-foreground/70 text-background hover:bg-foreground/50 transition-all shadow-inner'
                  : 'border-border text-foreground hover:bg-secondary transition-all'
                }
                variant={cv.hasVoted ? 'default' : 'outline'}
              >
                <ThumbsUp className={`h-4 w-4 mr-1 ${cv.hasVoted ? 'fill-current' : ''}`} />
                {cv.hasVoted ? t('community.card.voted') : t('community.card.vote')}
              </Button>
            )}
            <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary transition-all" onClick={() => window.location.href = `/cvs/${cv.id}`}>
              {t('community.card.viewCv')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommunityPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('votes');
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['community-cvs', page, searchTerm, selectedIndustry, selectedJob, selectedScore, sortBy],
    queryFn: async () => {
      const params: Record<string, string> = { page: String(page), limit: String(PAGE_SIZE) };
      if (searchTerm) params.search = searchTerm;
      if (selectedIndustry) params.targetIndustry = selectedIndustry;
      if (selectedJob) params.targetJob = selectedJob;
      if (selectedScore) params.minScore = selectedScore;
      if (sortBy) params.sort = sortBy;
      const r = await apiClient.get('/community/cvs', { params });
      return r.data;
    },
    enabled: isAuthenticated,
  });

  const { data: topCVs } = useQuery({ queryKey: ['top-cvs'], queryFn: async () => { const r = await apiClient.get('/community/top'); return r.data.data as CV[]; } });

  const cvs = data?.data as CV[] | undefined;
  const total = data?.pagination?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const hasActiveFilters = selectedIndustry || selectedJob || selectedScore;

  const clearFilters = () => {
    setSelectedIndustry(null);
    setSelectedJob(null);
    setSelectedScore(null);
    setSearchTerm('');
    setPage(1);
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustry(prev => prev === industry ? null : industry);
    setPage(1);
  };

  const toggleJob = (job: string) => {
    setSelectedJob(prev => prev === job ? null : job);
    setPage(1);
  };

  const toggleScore = (score: string) => {
    setSelectedScore(prev => prev === score ? null : score);
    setPage(1);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <header className="bg-background/50 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl text-foreground">CVMaster</Link>
            <nav className="flex items-center gap-3">
              <Link href="/dashboard" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors">{t('community.dashboard')}</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
          <FileText className="h-16 w-16 text-muted-foreground/50 mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('community.notAuthenticated.title')}</h1>
          <p className="text-muted-foreground mb-6 text-center max-w-md">{t('community.notAuthenticated.description')}</p>
          <div className="flex gap-3">
            <Link href="/login"><Button className="bg-foreground text-background hover:bg-foreground/90">{t('community.notAuthenticated.login')}</Button></Link>
            <Link href="/register"><Button variant="outline" className="border-border text-foreground hover:bg-secondary">{t('community.notAuthenticated.register')}</Button></Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-background/50 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-foreground">CVMaster</Link>
          <nav className="flex items-center gap-3">
            <Link href="/dashboard" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors">{t('community.dashboard')}</Link>
            <ThemeToggle />
            <ProfileDropdown />
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold mb-2 text-foreground">{t('community.title')}</h1><p className="text-muted-foreground">{t('community.subtitle')}</p></div>
        <Tabs defaultValue="explore" className="space-y-6">
          <TabsList className="bg-card border-border"><TabsTrigger value="explore" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">{t('community.tabs.explore')}</TabsTrigger><TabsTrigger value="top" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">{t('community.tabs.top')}</TabsTrigger></TabsList>
          <TabsContent value="explore">
            <div className="relative mb-6"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70" /><Input placeholder={t('community.search.placeholder')} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" /></div>

            {/* Sort + Clear */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('community.filters.sortBy')}</span>
                <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="bg-muted border border-border text-foreground text-sm rounded px-3 py-1.5">
                  <option value="votes">{t('community.filters.options.votes')}</option>
                  <option value="recent">{t('community.filters.options.recent')}</option>
                  <option value="score">{t('community.filters.options.score')}</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <X className="h-4 w-4" /> {t('community.filters.clearFilters')}
                </button>
              )}
            </div>

            {/* Industry + Score Filters Row */}
            <div className="mb-4 flex items-end gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('community.filters.industry')}</p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRY_FILTERS.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedIndustry === industry
                          ? 'bg-foreground text-background shadow-md'
                          : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('community.filters.scoreAts')}</p>
                <div className="flex gap-2">
                  {SCORE_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => toggleScore(filter.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        selectedScore === filter.value
                          ? 'bg-foreground text-background shadow-md'
                          : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Filters */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">{t('community.filters.job')}</p>
              <div className="flex flex-wrap gap-2">
                {JOB_FILTERS.map((job) => (
                  <button
                    key={job}
                    onClick={() => toggleJob(job)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedJob === job
                        ? 'bg-foreground text-background shadow-md'
                        : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                    }`}
                  >
                    {job}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filters indicator */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">{t('community.filters.activeFilters')}</span>
                <div className="flex gap-2 flex-wrap">
                  {selectedIndustry && (
                    <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80" onClick={() => { setSelectedIndustry(null); setPage(1); }}>
                      {selectedIndustry}
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                  {selectedJob && (
                    <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80" onClick={() => { setSelectedJob(null); setPage(1); }}>
                      {selectedJob}
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                  {selectedScore && (
                    <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80" onClick={() => { setSelectedScore(null); setPage(1); }}>
                      Score {selectedScore === 'low' ? '<70' : selectedScore === '90' ? '90+' : '70-89'}
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground underline">
                  {t('community.filters.clearAll')}
                </button>
              </div>
            )}

            {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-96 bg-secondary" />)}</div> : !cvs?.length ? <Card className="bg-card"><CardContent className="py-12 text-center text-muted-foreground">{t('community.filters.noResults')}</CardContent></Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{cvs.map((cv) => <CommunityCard key={cv.id} cv={cv} />)}</div>}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}>{p}</Button>
                ))}
                <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="top">
            {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 bg-secondary" />)}</div> : !topCVs?.length ? <Card className="bg-card"><CardContent className="py-12 text-center text-muted-foreground">{t('community.filters.noVoted')}</CardContent></Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{topCVs.map((cv) => <CommunityCard key={cv.id} cv={cv} />)}</div>}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
