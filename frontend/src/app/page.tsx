'use client';
import Link from 'next/link';
import { FileText, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <FileText className="h-6 w-6 text-primary" /><span>CVMaster</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild><Link href="/community">Comunidad</Link></Button>
            <Button asChild><Link href="/register">Empezar gratis</Link></Button>
          </nav>
        </div>
      </header>
      <main>
        <section className="py-24 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />Optimizado con IA GPT-4
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Tu CV listo para<span className="text-primary"> pasar los filtros ATS</span></h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Sube tu CV, indica el puesto y nuestra IA lo optimizará para superar los sistemas de seguimiento.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild><Link href="/register">Crear cuenta gratis<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/community">Ver ejemplos</Link></Button>
            </div>
          </div>
        </section>
        <section className="py-16 px-4 bg-slate-50">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card><CardHeader><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl font-bold text-primary">1</span></div><CardTitle>Sube tu CV</CardTitle><CardDescription>Formato PDF, máximo 10MB</CardDescription></CardHeader><CardContent><p className="text-muted-foreground">Arrastra o selecciona tu CV. La IA lo procesará en segundos.</p></CardContent></Card>
              <Card><CardHeader><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl font-bold text-primary">2</span></div><CardTitle>Indica tu objetivo</CardTitle><CardDescription>Puesto e industria</CardDescription></CardHeader><CardContent><p className="text-muted-foreground">Cuéntanos a qué puesto aplicas para optimizar específicamente.</p></CardContent></Card>
              <Card><CardHeader><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl font-bold text-primary">3</span></div><CardTitle>Recibe tu CV optimizado</CardTitle><CardDescription>Descarga y aplica</CardDescription></CardHeader><CardContent><p className="text-muted-foreground">Obtén un CV mejorado con palabras clave ATS y análisis detallado.</p></CardContent></Card>
            </div>
          </div>
        </section>
        <section className="py-16 px-4 bg-primary text-primary-foreground">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Empieza hoy</h2>
            <p className="text-primary-foreground/80 mb-8">Regístrate gratis y recibe tu primer CV optimizado en minutos</p>
            <Button size="lg" variant="secondary" asChild><Link href="/register">Crear cuenta gratis<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 px-4"><div className="container mx-auto text-center text-muted-foreground"><p>© 2024 CVMaster</p></div></footer>
    </div>
  );
}
