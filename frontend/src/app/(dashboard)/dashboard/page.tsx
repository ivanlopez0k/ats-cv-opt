'use client';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { CVList } from '@/components/features/cv/CVList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold">Mis CVs</h1><p className="text-muted-foreground">Gestiona tus currículums</p></div>
          <Button asChild><Link href="/dashboard/cvs/new"><Plus className="mr-2 h-4 w-4" />Nuevo CV</Link></Button>
        </div>
        <CVList />
      </main>
    </div>
  );
}
