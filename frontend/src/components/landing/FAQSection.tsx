'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '@/i18n';

const FAQS_ES = [
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

const FAQS_EN = [
  {
    question: 'What is an ATS and why does it matter?',
    answer: 'An ATS (Applicant Tracking System) is the software companies use to filter CVs automatically. More than 75% of CVs are never seen by a human because the ATS discards them. Optimizing your CV for ATS is essential to get an interview.',
  },
  {
    question: 'How does AI optimization work?',
    answer: 'You upload your CV in PDF, specify the position you\'re applying for, and our AI analyzes the text, identifies keyword gaps, restructures the content with action verbs, adds metrics, and optimizes the format to pass ATS filters.',
  },
  {
    question: 'Is my data safe?',
    answer: 'Yes. Your CV is processed securely and we never share your information without your consent. You can choose to keep your CV private or share it anonymously with the community.',
  },
  {
    question: 'Is it free?',
    answer: 'Yes, you can optimize your first CV completely free. No credit card or commitment required.',
  },
  {
    question: 'How long does the analysis take?',
    answer: 'AI analysis takes between 30 seconds and 2 minutes depending on server load. You receive a notification when your optimized CV is ready.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden transition-colors hover:border-border/80">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/50 transition-colors"
      >
        <span className="text-foreground font-medium pr-4">{question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const { locale } = useI18n();
  const faqs = locale === 'en' ? FAQS_EN : FAQS_ES;
  const title = locale === 'en' ? 'Frequently asked questions' : 'Preguntas frecuentes';
  const subtitle = locale === 'en' 
    ? 'Everything you need to know about CVMaster and ATS' 
    : 'Todo lo que necesitás saber sobre CVMaster y los ATS';

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}