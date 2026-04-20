'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Target, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/authStore';

const STEPS = [
  {
    icon: FileUp,
    title: 'Sube tu CV',
    description: 'Subí tu currículum en PDF y nuestra IA lo analizará en segundos.',
  },
  {
    icon: Target,
    title: 'Indicá el puesto',
    description: 'Decinos qué puesto buscás y en qué industria.',
  },
  {
    icon: Sparkles,
    title: 'La IA lo optimiza',
    description: 'Tu CV será mejorado para pasar los filtros ATS y aumentar tus chances.',
  },
];

const ONBOARDING_KEY = 'hasSeenOnboarding';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { user } = useAuthStore();

  // Check localStorage on mount
  useEffect(() => {
    if (user) {
      const seen = localStorage.getItem(ONBOARDING_KEY);
      if (!seen) {
        setIsOpen(true);
      }
    }
  }, [user]);

  // Don't show if no user or already closed
  if (!user || !isOpen) return null;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setIsOpen(false);
      router.push('/dashboard');
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const Icon = STEPS[currentStep].icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-xl border border-border p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              aria-label="Omitir tutorial"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep ? 'bg-foreground' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-secondary rounded-full">
                <Icon className="h-8 w-8 text-foreground" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-xl font-bold text-foreground text-center mb-2">
              {STEPS[currentStep].title}
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              {STEPS[currentStep].description}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Omitir
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-foreground text-background"
              >
                {currentStep === STEPS.length - 1 ? 'Empezar' : 'Siguiente'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}