'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText } from 'lucide-react';

interface CVPreviewProps {
  cvId: string;
  userId: string;
  improvedHtmlUrl?: string;
  improvedPdfUrl?: string;
}

export function CVPreview({ cvId, userId, improvedHtmlUrl, improvedPdfUrl }: CVPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

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
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Ocultar preview' : 'Ver preview'}
          </Button>
        )}
        {improvedPdfUrl && (
          <a href={improvedPdfUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-white text-black font-medium hover:bg-gray-200 shadow-lg shadow-white/10">
              <Download className="mr-2 h-4 w-4" /> Descargar PDF
            </Button>
          </a>
        )}
      </div>

      {/* HTML Preview */}
      {showPreview && improvedHtmlUrl && (
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" /> Vista previa del CV
            </CardTitle>
            <CardDescription className="text-gray-400">
              Así se ve tu CV optimizado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[800px] bg-white">
              <iframe
                src={improvedHtmlUrl}
                className="w-full h-full border-0"
                title="CV Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
