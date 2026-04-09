'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/50 transition-colors"
      >
        <span className="text-foreground font-medium pr-4">{question}</span>
        {open ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

export function FAQSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground">
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
  );
}
