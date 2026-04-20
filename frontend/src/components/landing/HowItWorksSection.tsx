'use client';

import { Upload, Target, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';

export function HowItWorksSection() {
  const { t } = useI18n();

  const steps = [
    {
      step: '1',
      icon: Upload,
      titleKey: 'landing.howItWorks.steps.upload.title',
      descKey: 'landing.howItWorks.steps.upload.description',
    },
    {
      step: '2',
      icon: Target,
      titleKey: 'landing.howItWorks.steps.target.title',
      descKey: 'landing.howItWorks.steps.target.description',
    },
    {
      step: '3',
      icon: Sparkles,
      titleKey: 'landing.howItWorks.steps.optimize.title',
      descKey: 'landing.howItWorks.steps.optimize.description',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          {t('landing.howItWorks.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, i) => (
            <Card key={i} className="bg-card border-border transition-all duration-300 hover:border-border/80 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4 border border-border transition-transform duration-300 hover:scale-110">
                  <item.icon className="h-7 w-7 text-foreground" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-foreground text-sm font-bold mx-auto mb-2">
                  {item.step}
                </div>
                <CardTitle className="text-foreground text-xl">{t(item.titleKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t(item.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
