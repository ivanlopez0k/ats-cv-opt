'use client';

import { Zap, Target, BarChart3, Users, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';

const FEATURE_ICONS: Record<string, typeof Zap> = {
  ats: Zap,
  target: Target,
  score: BarChart3,
  community: Users,
  privacy: Shield,
  ai: Globe,
};

const FEATURE_KEYS = ['ats', 'target', 'score', 'community', 'privacy', 'ai'];

export function FeaturesSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('landing.features.header')}{' '}
            <span className="text-muted-foreground">
              {t('landing.features.subtitle.highlight')}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('landing.features.subtitle.desc')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_KEYS.map((key) => {
            const Icon = FEATURE_ICONS[key as keyof typeof FEATURE_ICONS];
            return (
              <Card key={key} className="bg-card border-border transition-all duration-300 hover:border-border/80 hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 border border-border transition-transform duration-300 hover:scale-110">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <CardTitle className="text-foreground text-lg">{t(`landing.features.items.${key}.title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(`landing.features.items.${key}.description`)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}