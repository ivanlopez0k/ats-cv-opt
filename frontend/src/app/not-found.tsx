import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página que buscás no existe o fue movida.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl text-foreground">404</CardTitle>
          <CardDescription>
            La página que buscás no existe o fue movida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" /> Ir al inicio
            </Button>
          </Link>
          <Link href="/dashboard" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Ir al dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
