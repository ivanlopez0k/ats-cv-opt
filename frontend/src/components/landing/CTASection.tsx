'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useI18n } from '@/i18n';

export function CTASection() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useI18n();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center max-w-2xl">
        <div className="bg-card rounded-2xl p-12 border border-border">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border">
            <Sparkles className="h-8 w-8 text-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('landing.cta.title')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isAuthenticated
              ? t('landing.cta.subtitleAuth')
              : t('landing.cta.subtitle')}
          </p>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-background bg-gradient-to-r from-foreground to-foreground/80 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
            >
              {t('landing.hero.dashboard')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <a
              href="/register"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-background bg-gradient-to-r from-foreground to-foreground/80 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
            >
              {t('landing.cta.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}