'use client';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { CVUploadForm } from '@/components/features/cv/CVUploadForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewCVPage() {
  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Link>
        <h1 className="text-3xl font-bold mb-2 text-white">Subir Nuevo CV</h1><p className="text-gray-400 mb-6">La IA lo optimizará</p>
        <CVUploadForm />
      </main>
    </div>
  );
}
