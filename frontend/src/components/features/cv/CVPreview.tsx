'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText, Loader2 } from 'lucide-react';

interface CVPreviewProps {
  cvId: string;
  userId: string;
  improvedHtmlUrl?: string;
  improvedPdfUrl?: string;
}

/**
 * Basic client-side HTML sanitization for defense in depth.
 * Removes dangerous tags and attributes before injecting in iframe.
 */
function sanitizeHtmlClient(html: string): string {
  return (
    html
      // Remove script tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove event handlers
      .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\son\w+\s*=\s*\S+/gi, '')
      // Remove javascript: URLs
      .replace(/javascript\s*:/gi, '')
      // Remove data: URLs in src (except images)
      .replace(/<(?!img)\b[^>]*\ssrc\s*=\s*["']data:/gi, (match) => match.replace('data:', 'blocked:'))
  );
}

export function CVPreview({ cvId, userId, improvedHtmlUrl, improvedPdfUrl }: CVPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showPreview && improvedHtmlUrl && !htmlContent) {
      setLoading(true);
      fetch(improvedHtmlUrl)
        .then((res) => res.text())
        .then((html) => {
          // Sanitize HTML before injecting in iframe (defense in depth)
          setHtmlContent(sanitizeHtmlClient(html));
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [showPreview, improvedHtmlUrl, htmlContent]);

  if (!improvedHtmlUrl && !improvedPdfUrl) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-3">
        {improvedHtmlUrl && (
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Ocultar preview' : 'Ver preview'}
          </Button>
        )}
        {improvedPdfUrl && (
          <a href={improvedPdfUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-foreground text-background font-medium hover:bg-foreground/90">
              <Download className="mr-2 h-4 w-4" /> Descargar PDF
            </Button>
          </a>
        )}
      </div>

      {/* HTML Preview */}
      {showPreview && improvedHtmlUrl && (
        <Card className="bg-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5" /> Vista previa del CV
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Así se ve tu CV optimizado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-[800px]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Cargando preview...</p>
                </div>
              </div>
            ) : htmlContent ? (
              <div className="w-full h-[800px] bg-white">
                <iframe
                  srcDoc={htmlContent}
                  className="w-full h-full border-0"
                  title="CV Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[800px]">
                <p className="text-muted-foreground text-sm">No se pudo cargar el preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
