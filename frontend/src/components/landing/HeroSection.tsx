'use client';

import Link from 'next/link';
import { ArrowRight, FileText, BarChart3, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useI18n } from '@/i18n';
import { motion } from 'framer-motion';

function TypewriterTitle() {
  const { t } = useI18n();
  const title1 = String(t('landing.hero.title1')).split(',');
  const title2 = String(t('landing.hero.title2')).split(',');
  const words = [...title1, null, ...title2];

  return (
    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-foreground">
      {words.map((word, i) =>
        word === null ? (
          <br key={`br-${i}`} />
        ) : (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.08, delay: 0.15 + i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
            className="inline-block mr-[0.25em]"
          >
            {word}
          </motion.span>
        )
      )}
    </h1>
  );
}

function DashboardMockup() {
  return (
    <div className="relative max-w-3xl mx-auto mt-16">
      <div className="relative bg-card rounded-xl border border-border overflow-hidden shadow-xl">
        <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/60" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-muted rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
              localhost:3000/dashboard
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-foreground/70" />
              <span className="text-foreground font-semibold">Mis CVs</span>
            </div>
            <div className="px-3 py-1.5 bg-secondary text-foreground text-xs rounded-lg font-medium border border-border">
              + Nuevo CV
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { title: 'Frontend Dev', score: 87, status: 'good' },
              { title: 'Backend Dev', score: 72, status: 'mid' },
              { title: 'Full Stack', score: 91, status: 'good' },
            ].map((cv, i) => (
              <div key={i} className="bg-secondary/50 rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-foreground text-sm font-medium truncate">{cv.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    cv.status === 'good' ? 'bg-muted text-foreground/80' : 'bg-muted/50 text-muted-foreground'
                  }`}>
                    {cv.score}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      cv.status === 'good' ? 'bg-foreground/60' : 'bg-foreground/40'
                    }`}
                    style={{ width: `${cv.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-foreground/70" />
              <span className="text-foreground text-sm font-medium">Análisis ATS — Full Stack Dev</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-foreground">91</div>
              <div className="flex-1">
                <div className="flex gap-1.5 flex-wrap">
                  {['React', 'Node.js', 'TypeScript', 'AWS'].map((kw) => (
                    <span key={kw} className="text-xs bg-secondary/50 text-foreground/80 px-2 py-1 rounded border border-border">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Fade to transparent at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
    </div>
  );
}

export function HeroSection() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useI18n();

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-full text-sm font-medium mb-6 border border-border">
            <Sparkles className="h-4 w-4" />
            {t('landing.hero.badge')}
          </div>
        </motion.div>

        <TypewriterTitle />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          {t('landing.hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-primary-foreground bg-primary rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              {t('landing.hero.dashboard')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <a
              href="/register"
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-primary-foreground bg-primary rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              {t('landing.hero.ctaPrimary')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          )}
          <a
            href="#como-funciona"
            className="inline-flex items-center px-6 py-4 text-base font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            {t('landing.hero.ctaSecondary')}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1, ease: 'easeOut' }}
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
