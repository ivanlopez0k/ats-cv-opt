import { Zap, Target, BarChart3, Users, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FEATURES = [
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

export function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Todo lo que necesitás para{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              destacar
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Herramientas poderosas para optimizar tu CV y conseguir más entrevistas
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <Card key={i} className="glass-card group hover:shadow-lg hover:shadow-white/5 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
