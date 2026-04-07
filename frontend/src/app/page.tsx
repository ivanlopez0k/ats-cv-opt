'use client';
import Link from 'next/link';
import { FileText, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <FileText className="h-6 w-6 text-white" /><span className="text-white">CVMaster</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/community" className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg hover:bg-white/10 transition-colors">Comunidad</Link>
            <Link href="/register" className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-white rounded-lg hover:bg-gray-200 shadow-lg shadow-white/10 transition-all">Empezar gratis</Link>
          </nav>
        </div>
      </header>
      <main>
        <section className="py-24 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
              <Sparkles className="h-4 w-4" />Optimizado con IA GPT-4
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">Tu CV listo para<span className="text-white"> pasar los filtros ATS</span></h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">Sube tu CV, indica el puesto y nuestra IA lo optimizará para superar los sistemas de seguimiento.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="inline-flex items-center px-8 py-4 text-base font-semibold text-black bg-gradient-to-r from-white to-gray-200 rounded-lg shadow-xl shadow-white/20 hover:shadow-white/30 hover:scale-105 transition-all duration-300 glow-white-hover">Crear cuenta gratis<ArrowRight className="ml-2 h-5 w-5" /></a>
              <a href="/community" className="inline-flex items-center px-6 py-4 text-base font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors">Ver ejemplos</a>
            </div>
          </div>
        </section>
        <section className="py-16 px-4 bg-black/40">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">¿Cómo funciona?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="glass-card"><CardHeader><div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl font-bold text-white">1</span></div><CardTitle className="text-white">Sube tu CV</CardTitle><CardDescription className="text-gray-400">Formato PDF, máximo 10MB</CardDescription></CardHeader><CardContent><p className="text-gray-400">Arrastra o selecciona tu CV. La IA lo procesará en segundos.</p></CardContent></Card>
              <Card className="glass-card"><CardHeader><div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl font-bold text-white">2</span></div><CardTitle className="text-white">Indica tu objetivo</CardTitle><CardDescription className="text-gray-400">Puesto e industria</CardDescription></CardHeader><CardContent><p className="text-gray-400">Cuéntanos a qué puesto aplicas para optimizar específicamente.</p></CardContent></Card>
              <Card className="glass-card"><CardHeader><div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl font-bold text-white">3</span></div><CardTitle className="text-white">Recibe tu CV optimizado</CardTitle><CardDescription className="text-gray-400">Descarga y aplica</CardDescription></CardHeader><CardContent><p className="text-gray-400">Obtén un CV mejorado con palabras clave ATS y análisis detallado.</p></CardContent></Card>
            </div>
          </div>
        </section>
        <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-black border-y border-white/10">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4 text-white">Empieza hoy</h2>
            <p className="text-gray-400 mb-8">Regístrate gratis y recibe tu primer CV optimizado en minutos</p>
            <a href="/register" className="inline-flex items-center px-8 py-4 text-base font-semibold text-black bg-gradient-to-r from-white to-gray-200 rounded-lg shadow-xl shadow-white/20 hover:shadow-white/30 hover:scale-105 transition-all duration-300 glow-white-hover">Crear cuenta gratis<ArrowRight className="ml-2 h-5 w-5" /></a>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 py-8 px-4"><div className="container mx-auto text-center text-gray-500"><p>© 2024 CVMaster</p></div></footer>
    </div>
  );
}

