'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useI18n } from '@/i18n';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function LandingHeader() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useI18n();

  return (
    <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl cursor-pointer">
          <FileText className="h-6 w-6" />
          <span>CVMaster</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/community" className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors">
            {t('landing.header.community')}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <Link href="/register" className="inline-flex items-center px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all">
              {t('landing.header.startFree')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
