'use client';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { CVList } from '@/components/features/cv/CVList';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold text-white">Mis CVs</h1><p className="text-gray-400">Gestiona tus currículums</p></div>
          <Link href="/dashboard/cvs/new" className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-gray-200 shadow-lg shadow-white/10 transition-all"><Plus className="mr-2 h-4 w-4" />Nuevo CV</Link>
        </div>
        <CVList />
      </main>
    </div>
  );
}
