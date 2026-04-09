'use client';

import Link from 'next/link';
import { FileText, User, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function LandingHeader() {
  const { isAuthenticated, user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const initials = user?.username?.slice(0, 2).toUpperCase() || user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <FileText className="h-6 w-6" />
          <span>CVMaster</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/community" className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors">
            Comunidad
          </Link>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
          {isAuthenticated ? (
            <Link href="/dashboard" className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-all">
              <span className="text-sm font-semibold">{initials}</span>
            </Link>
          ) : (
            <Link href="/register" className="inline-flex items-center px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all">
              Empezar gratis
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
