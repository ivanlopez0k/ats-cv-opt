'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';

export function CTASection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center max-w-2xl">
        <div className="glass-card rounded-2xl p-12 border border-white/10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
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
  );
}
