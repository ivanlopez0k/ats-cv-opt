'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  FileText, Sparkles, ArrowRight, User, Zap, Target, BarChart3,
  Users, CheckCircle2, ChevronDown, ChevronUp, Shield, Globe,
  ArrowUpRight, Eye, Layers, Award, Star, Upload
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/authStore';

// ============================================================
// DATA
// ============================================================
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

const FAQS = [
  {
    question: '¿Qué es un ATS y por qué importa?',
    answer: 'Un ATS (Applicant Tracking System) es el software que usan las empresas para filtrar CVs automáticamente. Más del 75% de los CVs nunca son vistos por un humano porque el ATS los descarta. Optimizar tu CV para ATS es fundamental para llegar a una entrevista.',
  },
  {
    question: '¿Cómo funciona la optimización con IA?',
    answer: 'Subís tu CV en PDF, indicás el puesto al que querés aplicar, y nuestra IA analiza el texto, identifica gaps de keywords, reestructura el contenido con verbos de acción, agrega métricas y optimiza el formato para que pase los filtros ATS.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer: 'Sí. Tu CV se procesa de forma segura y nunca compartimos tu información sin tu consentimiento. Podés elegir mantener tu CV privado o compartirlo anónimamente con la comunidad.',
  },
  {
    question: '¿Es gratis?',
    answer: 'Sí, podés optimizar tu primer CV completamente gratis. No necesitas tarjeta de crédito ni compromiso.',
  },
  {
    question: '¿Cuánto tarda el análisis?',
    answer: 'El análisis con IA tarda entre 30 segundos y 2 minutos dependiendo de la carga del servidor. Recibís una notificación cuando tu CV optimizado está listo.',
  },
];

const STATS = [
  { value: '75%', label: 'de CVs son descartados por ATS antes de ser leídos' },
  { value: '40%', label: 'más entrevistas con un CV optimizado para ATS' },
  { value: '6s', label: 'promedio que un reclutador mira tu CV' },
  { value: '98%', label: 'de Fortune 500 usan sistemas ATS' },
];

// ============================================================
// COMPONENTS
// ============================================================

function DashboardMockup() {
  return (
    <div className="relative max-w-3xl mx-auto mt-16">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl" />
      
      {/* Browser chrome */}
      <div className="relative bg-gray-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-gray-700/50 rounded-md px-3 py-1 text-xs text-gray-400 text-center">
              localhost:3000/dashboard
            </div>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <span className="text-white font-semibold">Mis CVs</span>
            </div>
            <div className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg font-medium">
              + Nuevo CV
            </div>
          </div>
          
          {/* CV Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { title: 'Frontend Dev', score: 87, status: 'green' },
              { title: 'Backend Dev', score: 72, status: 'yellow' },
              { title: 'Full Stack', score: 91, status: 'green' },
            ].map((cv, i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-sm font-medium truncate">{cv.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    cv.status === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {cv.score}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      cv.status === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${cv.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Analysis preview */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-white text-sm font-medium">Análisis ATS — Full Stack Dev</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-green-400">91</div>
              <div className="flex-1">
                <div className="flex gap-1.5 flex-wrap">
                  {['React', 'Node.js', 'TypeScript', 'AWS'].map((kw) => (
                    <span key={kw} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BeforeAfterComparison() {
  return (
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
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium pr-4">{question}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const initials = user?.username?.slice(0, 2).toUpperCase() || user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <FileText className="h-6 w-6 text-white" />
            <span className="text-white">CVMaster</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/community" className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg hover:bg-white/10 transition-colors">
              Comunidad
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">
                <span className="text-sm font-semibold">{initials}</span>
              </Link>
            ) : (
              <Link href="/register" className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-gray-200 shadow-lg shadow-white/10 transition-all">
                Empezar gratis
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
              <Sparkles className="h-4 w-4" />
              Optimizado con IA GPT-4
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              Tu CV listo para{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                pasar los filtros ATS
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Sube tu CV, indicá el puesto y nuestra IA lo optimizará para superar
              los sistemas de seguimiento de candidatos que usan el 98% de las empresas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 text-base font-semibold text-black bg-gradient-to-r from-white to-gray-200 rounded-lg shadow-xl shadow-white/20 hover:shadow-white/30 hover:scale-105 transition-all duration-300"
                >
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <a
                  href="/register"
                  className="inline-flex items-center px-8 py-4 text-base font-semibold text-black bg-gradient-to-r from-white to-gray-200 rounded-lg shadow-xl shadow-white/20 hover:shadow-white/30 hover:scale-105 transition-all duration-300"
                >
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              )}
              <a
                href="#como-funciona"
                className="inline-flex items-center px-6 py-4 text-base font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cómo funciona
              </a>
            </div>

            {/* Dashboard Mockup */}
            <DashboardMockup />
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-12 px-4 border-y border-white/5 bg-white/[0.02]">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before/After Section */}
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
            <BeforeAfterComparison />
          </div>
        </section>

        {/* How it Works */}
        <section id="como-funciona" className="py-20 px-4 bg-white/[0.02]">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
              ¿Cómo funciona?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
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
              ].map((item, i) => (
                <Card key={i} className="glass-card text-center">
                  <CardHeader>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white text-sm font-bold mx-auto mb-2">
                      {item.step}
                    </div>
                    <CardTitle className="text-white text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
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

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-white/[0.02]">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-gray-400">
                Todo lo que necesitás saber sobre CVMaster y los ATS
              </p>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-2xl">
            <div className="glass-card rounded-2xl p-12 border border-white/10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Empezá hoy
              </h2>
              <p className="text-gray-400 mb-8">
                {isAuthenticated
                  ? 'Gestioná y optimizá tus CVs desde el dashboard'
                  : 'Registrate gratis y recibí tu primer CV optimizado en minutos'}
              </p>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 text-base font-semibold text-black bg-gradient-to-r from-white to-gray-200 rounded-lg shadow-xl shadow-white/20 hover:shadow-white/30 hover:scale-105 transition-all duration-300"
                >
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <a
                  href="/register"
                  className="inline-flex items-center px-8 py-4 text-base font-semibold text-black bg-gradient-to-r from-white to-gray-200 rounded-lg shadow-xl shadow-white/20 hover:shadow-white/30 hover:scale-105 transition-all duration-300"
                >
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <FileText className="h-5 w-5" />
            CVMaster
          </div>
          <p className="text-gray-500 text-sm">© 2026 CVMaster. Optimizá tu CV, conseguí más entrevistas.</p>
        </div>
      </footer>
    </div>
  );
}
