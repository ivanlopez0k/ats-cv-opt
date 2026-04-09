import { Upload, Target, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STEPS = [
  {
    step: '1',
    icon: Upload,
    title: 'Sube tu CV',
    description: 'Arrastrá tu CV en PDF. Soportamos archivos de hasta 10MB.',
  },
  {
    step: '2',
    icon: Target,
    title: 'Indicá tu objetivo',
    description: 'Decinos a qué puesto y en qué industria querés aplicar.',
  },
  {
    step: '3',
    icon: Sparkles,
    title: 'Recibí tu CV optimizado',
    description: 'Descargá tu CV mejorado con score ATS y sugerencias detalladas.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          ¿Cómo funciona?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((item, i) => (
            <Card key={i} className="bg-card border-border transition-all duration-300 hover:border-border/80 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4 border border-border transition-transform duration-300 hover:scale-110">
                  <item.icon className="h-7 w-7 text-foreground" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-foreground text-sm font-bold mx-auto mb-2">
                  {item.step}
                </div>
                <CardTitle className="text-foreground text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
