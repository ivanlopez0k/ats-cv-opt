'use client';

'use client';

import { AnimatedCounter } from './AnimatedCounter';
import { useI18n } from '@/i18n';

const STATS_ES = [
  { value: '75%', label: 'de CVs son descartados por ATS antes de ser leídos' },
  { value: '40%', label: 'más entrevistas con un CV optimizado para ATS' },
  { value: '6s', label: 'promedio que un reclutador mira tu CV' },
  { value: '98%', label: 'de Fortune 500 usan sistemas ATS' },
];

const STATS_EN = [
  { value: '75%', label: 'of CVs are discarded by ATS before being read' },
  { value: '40%', label: 'more interviews with an ATS-optimized CV' },
  { value: '6s', label: 'average time a recruiter looks at your CV' },
  { value: '98%', label: 'of Fortune 500 companies use ATS systems' },
];

export function StatsBar() {
  const { locale } = useI18n();
  const stats = locale === 'en' ? STATS_EN : STATS_ES;

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                <AnimatedCounter value={stat.value} />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
