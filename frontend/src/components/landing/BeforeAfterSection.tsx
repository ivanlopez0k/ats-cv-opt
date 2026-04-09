import { CheckCircle2 } from 'lucide-react';

const BEFORE_AFTER = {
  before: {
    title: 'CV Original',
    score: 32,
    issues: ['Sin keywords del puesto', 'Sin métricas ni logros', 'Formato no ATS-friendly', 'Sin verbos de acción'],
  },
  after: {
    title: 'CV Optimizado',
    score: 89,
    improvements: ['Keywords del puesto integradas', 'Logros cuantificados con métricas', 'Formato limpio y estructurado', 'Verbos de acción en cada bullet'],
  },
};

export function BeforeAfterSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Antes vs Después
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Mirá la diferencia que hace optimizar tu CV para ATS
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Before */}
          <div className="glass-card rounded-xl p-6 border-red-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-400">{BEFORE_AFTER.before.title}</h3>
              <div className="text-2xl font-bold text-red-400">{BEFORE_AFTER.before.score}/100</div>
            </div>
            <div className="space-y-3">
              {BEFORE_AFTER.before.issues.map((issue, i) => (
                <div key={i} className="flex items-center gap-3 text-red-300/80 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500/50 shrink-0" />
                  {issue}
                </div>
              ))}
            </div>
          </div>
          
          {/* After */}
          <div className="glass-card rounded-xl p-6 border-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-400">{BEFORE_AFTER.after.title}</h3>
              <div className="text-2xl font-bold text-green-400">{BEFORE_AFTER.after.score}/100</div>
            </div>
            <div className="space-y-3">
              {BEFORE_AFTER.after.improvements.map((imp, i) => (
                <div key={i} className="flex items-center gap-3 text-green-300/80 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  {imp}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
