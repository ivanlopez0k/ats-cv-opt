'use client';

import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { CVUploadForm } from '@/components/features/cv/CVUploadForm';

export default function NewCVPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Subí tu CV</h1>
        <p className="text-muted-foreground mb-8">
          Nuestra IA analizará y optimizará tu CV para que superes los filtros ATS
        </p>
        <CVUploadForm />
      </main>
    </div>
  );
}
