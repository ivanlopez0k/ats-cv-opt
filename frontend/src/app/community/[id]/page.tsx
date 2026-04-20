import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, CheckCircle, XCircle, Download, FileText, Users, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { getCVDetail } from '@/lib/server/data';
import type { CV } from '@/lib/types';
import { CVVoting } from './CVVoting';

/**
 * Public CV Detail Page - Server Component
 * Renders CV data server-side, embeds client islands for interactivity
 */
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicCVDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch data on server
  const cv = await getCVDetail(id);

  // Handle not found
  if (!cv) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="bg-card">
            <CardContent className="py-12 text-center text-muted-foreground">CV no encontrado</CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const authorInitials = cv.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/community" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la comunidad
        </Link>

        {/* Header */}
        <Card className="bg-card mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-foreground">{cv.title}</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  {cv.targetJob && <span>{cv.targetJob}</span>}
                  {cv.targetJob && cv.targetIndustry && <span> · </span>}
                  {cv.targetIndustry && <span>{cv.targetIndustry}</span>}
                </CardDescription>
              </div>
              {cv.status === 'COMPLETED' && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Listo
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {/* Author */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-foreground text-background">{authorInitials}</AvatarFallback>
                </Avatar>
                <span>{cv.user?.name || 'Anónimo'}</span>
              </div>

              {/* Votes - Server rendered count */}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{cv.upvotes} votos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive voting - Client Island */}
        {cv.status === 'COMPLETED' && <CVVoting cv={cv} />}

        {/* Stats */}
        {cv.status === 'COMPLETED' && cv.analysisResult && (
          <Card className="bg-card mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">Análisis ATS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className={`text-5xl font-bold ${
                  cv.analysisResult.score >= 70
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : cv.analysisResult.score >= 40
                    ? 'text-yellow-500'
                    : 'text-destructive'
                }`}>
                  {cv.analysisResult.score}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    {cv.analysisResult.score >= 70
                      ? '¡Excelente! CV bien optimizado para ATS'
                      : cv.analysisResult.score >= 40
                      ? 'Buen punto de partida, hay margen de mejora'
                      : 'Necesita optimización para superar filtros ATS'}
                  </p>
                  {cv.analysisResult.missingKeywords && cv.analysisResult.missingKeywords.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Keywords faltantes:</p>
                      <div className="flex flex-wrap gap-2">
                        {cv.analysisResult.missingKeywords.slice(0, 8).map((kw: string, i: number) => (
                          <Badge key={i} variant="outline" className="border-border text-foreground text-xs">
                            {kw}
                          </Badge>
                        ))}
                        {cv.analysisResult.missingKeywords.length > 8 && (
                          <Badge variant="outline" className="text-muted-foreground text-xs">
                            +{cv.analysisResult.missingKeywords.length - 8} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issues & Suggestions */}
        {cv.status === 'COMPLETED' && cv.analysisResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Issues */}
            {cv.analysisResult.issues && cv.analysisResult.issues.length > 0 && (
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" /> Problemas detectados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {cv.analysisResult.issues.map((issue: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-destructive mt-0.5">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {cv.analysisResult.suggestions && cv.analysisResult.suggestions.length > 0 && (
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Sugerencias de mejora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {cv.analysisResult.suggestions.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Download buttons - Server rendered links */}
        {cv.status === 'COMPLETED' && (
          <Card className="bg-card">
            <CardContent className="py-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {cv.originalPdfUrl && (
                  <a href={cv.originalPdfUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-border text-foreground">
                      <FileText className="mr-2 h-4 w-4" /> PDF Original
                    </Button>
                  </a>
                )}
                {cv.improvedPdfUrl && (
                  <a href={cv.improvedPdfUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-foreground text-background hover:bg-foreground/90">
                      <Download className="mr-2 h-4 w-4" /> Descargar CV Mejorado
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing/Failed states - Server rendered */}
        {cv.status === 'PROCESSING' && (
          <Card className="bg-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Este CV aún está siendo procesado por la IA.</p>
              <p className="text-sm mt-2">Volvé más tarde para ver el resultado.</p>
            </CardContent>
          </Card>
        )}

        {cv.status === 'FAILED' && (
          <Card className="bg-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Error al procesar este CV.</p>
              <p className="text-sm mt-2">El usuario puede intentar subirlo nuevamente.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

/**
 * Generate static metadata for the page
 */
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const cv = await getCVDetail(id);
  
  if (!cv) {
    return { title: 'CV no encontrado' };
  }

  return {
    title: `${cv.title} | CVMaster`,
    description: cv.targetJob ? `CV de ${cv.targetJob} - Score ATS: ${cv.analysisResult?.score || 'N/A'}` : 'CV optimizado con IA',
  };
}