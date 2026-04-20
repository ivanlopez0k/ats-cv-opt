'use client';

import Link from 'next/link';
import { FileText, BarChart3 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { NotificationBell } from '@/components/features/notification/NotificationBell';

export function DashboardHeader() {
  return (
    <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl cursor-pointer">
          <FileText className="h-6 w-6" /><span>CVMaster</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/community" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors">Comunidad</Link>
          <Link href="/dashboard/stats" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors">
            <BarChart3 className="h-4 w-4 mr-1" />Estadísticas
          </Link>
          <NotificationBell />
          <ThemeToggle />
          <ProfileDropdown />
        </nav>
      </div>
    </header>
  );
}
