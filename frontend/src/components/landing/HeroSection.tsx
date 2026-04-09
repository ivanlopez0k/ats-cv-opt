'use client';

import Link from 'next/link';
import { ArrowRight, FileText, BarChart3, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';

function DashboardMockup() {
  return (
    <div className="relative max-w-3xl mx-auto mt-16">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl" />
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
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <span className="text-white font-semibold">Mis CVs</span>
            </div>
            <div className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg font-medium">
              + Nuevo CV
            </div>
          </div>
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

export function HeroSection() {
  const { isAuthenticated } = useAuthStore();

  return (
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

        <DashboardMockup />
      </div>
    </section>
  );
}
