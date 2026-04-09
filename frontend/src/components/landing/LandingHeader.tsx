'use client';

import Link from 'next/link';
import { FileText, User } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';

export function LandingHeader() {
  const { isAuthenticated, user } = useAuthStore();
  const initials = user?.username?.slice(0, 2).toUpperCase() || user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <FileText className="h-6 w-6 text-white" />
          <span className="text-white">CVMaster</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/community" className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg hover:bg-white/10 transition-colors">
            Comunidad
          </Link>
          {isAuthenticated ? (
            <Link href="/dashboard" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">
              <span className="text-sm font-semibold">{initials}</span>
            </Link>
          ) : (
            <Link href="/register" className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-gray-200 shadow-lg shadow-white/10 transition-all">
              Empezar gratis
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
