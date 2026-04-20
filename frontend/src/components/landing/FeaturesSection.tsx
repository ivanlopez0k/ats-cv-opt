'use client';

import { Zap, Target, BarChart3, Users, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';

const FEATURES_ES = [
  {
    icon: Zap,
    title: 'Análisis ATS Instantáneo',
    description: 'Nuestra IA escanea tu CV contra los filtros de los Applicant Tracking Systems y te dice exactamente qué mejorar.',
  },
  {
    icon: Target,
    title: 'Optimizado por Puesto',
    description: 'Indicá el puesto objetivo y la IA personaliza tu CV con las keywords exactas que buscan los reclutadores.',
  },
  {
    icon: BarChart3,
    title: 'Score ATS Detallado',
    description: 'Recibí un puntaje del 0 al 100 con issues específicos, keywords faltantes y sugerencias de mejora.',
  },
  {
    icon: Users,
    title: 'Comunidad de CVs',
    description: 'Explorá CVs exitosos de otros usuarios, votá los mejores y aprendé de lo que realmente funciona.',
  },
  {
    icon: Shield,
    title: 'Privacidad Total',
    description: 'Tus datos están seguros. Podés elegir si compartir tu CV con la comunidad o mantenerlo privado.',
  },
  {
    icon: Globe,
    title: 'IA con GPT-4',
    description: 'Usamos los modelos más avanzados de OpenAI para garantizar la mejor optimización posible.',
  },
];

const FEATURES_EN = [
  {
    icon: Zap,
    title: 'Instant ATS Analysis',
    description: 'Our AI scans your CV against ATS filters and tells you exactly what to improve.',
  },
  {
    icon: Target,
    title: 'Job-Optimized',
    description: 'Specify your target position and AI customizes your CV with the exact keywords recruiters look for.',
  },
  {
    icon: BarChart3,
    title: 'Detailed ATS Score',
    description: 'Get a score from 0 to 100 with specific issues, missing keywords, and improvement suggestions.',
  },
  {
    icon: Users,
    title: 'CV Community',
    description: 'Explore successful CVs from other users, vote for the best, and learn from what really works.',
  },
  {
    icon: Shield,
    title: 'Total Privacy',
    description: 'Your data is safe. You can choose to share your CV with the community or keep it private.',
  },
  {
    icon: Globe,
    title: 'GPT-4 AI',
    description: 'We use the most advanced OpenAI models to guarantee the best possible optimization.',
  },
];

export function FeaturesSection() {
  const { locale } = useI18n();
  const features = locale === 'en' ? FEATURES_EN : FEATURES_ES;
  const subtitle = locale === 'en' 
    ? { highlight: 'stand out', desc: 'Powerful tools to optimize your CV and get more interviews' }
    : { highlight: 'destacar', desc: 'Herramientas poderosas para optimizar tu CV y conseguir más entrevistas' };
  const header = locale === 'en' ? 'Everything you need to' : 'Todo lo que necesitás para';

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {header}{' '}
            <span className="text-muted-foreground">
              {subtitle.highlight}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {subtitle.desc}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="bg-card border-border transition-all duration-300 hover:border-border/80 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 border border-border transition-transform duration-300 hover:scale-110">
                  <feature.icon className="h-6 w-6 text-foreground" />
                </div>
                <CardTitle className="text-foreground text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}