'use client';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { CVUploadForm } from '@/components/features/cv/CVUploadForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewCVPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" asChild className="mb-4"><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Link></Button>
        <h1 className="text-3xl font-bold mb-2">Subir Nuevo CV</h1><p className="text-muted-foreground mb-6">La IA lo optimizará</p>
        <CVUploadForm />
      </main>
    </div>
  );
}
