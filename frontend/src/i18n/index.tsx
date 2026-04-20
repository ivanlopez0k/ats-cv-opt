'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'es' | 'en';

interface TranslationContent {
  [key: string]: string | TranslationContent;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Spanish translations
const es: TranslationContent = {
  common: {
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    back: "Volver",
    continue: "Continuar"
  },
  landing: {
    header: {
      login: "Iniciar sesión",
      register: "Crear cuenta",
      switch: "Cambiar idioma",
      community: "Comunidad",
      startFree: "Empezar gratis"
    },
    hero: {
      badge: "Optimizado con IA GPT-4",
      subtitle: "Sube tu CV, indicá el puesto y nuestra IA lo optimizará para superar los sistemas de seguimiento de candidatos que usan el 98% de las empresas.",
      ctaPrimary: "Crear cuenta gratis",
      ctaSecondary: "Cómo funciona",
      dashboard: "Ir al Dashboard"
    },
    stats: {
      title: "Números que говорят",
      cvs: "CVs analizados",
      ats: "Pass rate ATS",
      users: "Usuarios satisfechos"
    },
    howItWorks: {
      title: "Cómo funciona",
      steps: {
        upload: {
          title: "Subí tu CV",
          description: "Sube tu currículum en PDF y nuestra IA lo analizará en segundos"
        },
        target: {
          title: "Indicá el puesto",
          description: "Decinos qué puesto buscás y en qué industria"
        },
        optimize: {
          title: "La IA lo optimiza",
          description: "Tu CV será mejorado para pasar los filtros ATS y aumentar tus chances"
        }
      }
    },
    features: {
      title: "Por qué CVMaster",
      items: {
        ats: {
          title: "Optimizado para ATS",
          description: "Nuestros algoritmos conocen los filtros de los principales sistemas ATS"
        },
        ai: {
          title: "Inteligencia Artificial",
          description: "GPT-4 analiza y mejora cada sección de tu currículum"
        },
        fast: {
          title: "Resultados rápidos",
          description: "En segundos tenés tu CV optimizado listo para enviar"
        },
        templates: {
          title: "Múltiples templates",
          description: "Elegí el diseño que mejor se adapte a tu industria"
        }
      }
    },
    faq: {
      title: "Preguntas frecuentes",
      questions: {
        q1: "Cuánto tiempo tarda el análisis?",
        a1: "El análisis con IA tarda entre 30 segundos y 2 minutos dependiendo de la carga del servidor.",
        q2: "Qué es ATS?",
        a2: "ATS son las siglas de Applicant Tracking System, software que las empresas usan para filtrar candidatos.",
        q3: "Es seguro subir mi CV?",
        a3: "Sí, tus datos están seguros. No compartimos tu información con terceros.",
        q4: "Cuántos CVs puedo subir?",
        a4: "Podés subir CVs ilimitados en la versión gratuita!"
      }
    },
    cta: {
      title: "Empezá hoy",
      subtitle: "Tu primer CV optimizado en minutos",
      button: "Subir mi CV gratis"
    },
    footer: {
      rights: "Todos los derechos reservados"
    }
  },
  dashboard: {
    title: "Mi Dashboard",
    stats: {
      title: "Mis Estadísticas",
      total: "Total CVs",
      completed: "Completados",
      processing: "En proceso",
      failed: "Fallidos",
      public: "Públicos",
      private: "Privados",
      avgScore: "Score promedio",
      votes: "Votos recibidos"
    },
    notifications: {
      title: "Notificaciones",
      empty: "No tenés notificaciones"
    },
    settings: {
      title: "Configuración"
    }
  },
  auth: {
    login: {
      title: "Iniciar sesión",
      email: "Email",
      password: "Contraseña",
      submit: "Iniciar sesión",
      forgotPassword: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tenés cuenta?",
      register: "Crear cuenta"
    },
    register: {
      title: "Crear cuenta",
      name: "Nombre completo",
      email: "Email",
      password: "Contraseña",
      confirmPassword: "Confirmar contraseña",
      submit: "Crear cuenta",
      hasAccount: "¿Ya tenés cuenta?",
      login: "Iniciar sesión"
    }
  },
  community: {
    title: "Comunidad"
  }
};

// English translations
const en: TranslationContent = {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    continue: "Continue"
  },
  landing: {
    header: {
      login: "Log in",
      register: "Sign up",
      switch: "Switch language",
      community: "Community",
      startFree: "Get started free"
    },
    hero: {
      badge: "AI-optimized with GPT-4",
      title1: "Your,CV,ready,to,pass",
      title2: "ATS,filters",
      subtitle: "Upload your CV, specify the job, and our AI will optimize it to pass the candidate tracking systems used by 98% of companies.",
      ctaPrimary: "Create free account",
      ctaSecondary: "How it works",
      dashboard: "Go to Dashboard"
    },
    stats: {
      title: "Numbers that speak",
      cvs: "CVs analyzed",
      ats: "ATS pass rate",
      users: "Happy users"
    },
    howItWorks: {
      title: "How it works",
      steps: {
        upload: {
          title: "Upload your CV",
          description: "Upload your resume in PDF and our AI will analyze it in seconds"
        },
        target: {
          title: "Choose target job",
          description: "Tell us what position you're looking for and in which industry"
        },
        optimize: {
          title: "AI optimizes",
          description: "Your CV will be improved to pass ATS filters and increase your chances"
        }
      }
    },
    features: {
      title: "Why CVMaster",
      items: {
        ats: {
          title: "ATS Optimized",
          description: "Our algorithms know the filters of major ATS systems"
        },
        ai: {
          title: "Artificial Intelligence",
          description: "GPT-4 analyzes and improves every section of your resume"
        },
        fast: {
          title: "Fast Results",
          description: "In seconds you have your optimized CV ready to send"
        },
        templates: {
          title: "Multiple Templates",
          description: "Choose the design that best fits your industry"
        }
      }
    },
    faq: {
      title: "Frequently asked questions",
      questions: {
        q1: "How long does the analysis take?",
        a1: "AI analysis takes between 30 seconds and 2 minutes depending on server load.",
        q2: "What is ATS?",
        a2: "ATS stands for Applicant Tracking System, software companies use to filter candidates.",
        q3: "Is it safe to upload my CV?",
        a3: "Yes, your data is safe. We don't share your information with third parties.",
        q4: "How many CVs can I upload?",
        a4: "You can upload unlimited CVs in the free version!"
      }
    },
    cta: {
      title: "Start today",
      subtitle: "Your first optimized CV in minutes",
      button: "Upload my CV for free"
    },
    footer: {
      rights: "All rights reserved"
    }
  },
  dashboard: {
    title: "My Dashboard",
    stats: {
      title: "My Statistics",
      total: "Total CVs",
      completed: "Completed",
      processing: "Processing",
      failed: "Failed",
      public: "Public",
      private: "Private",
      avgScore: "Avg score",
      votes: "Votes received"
    },
    notifications: {
      title: "Notifications",
      empty: "You have no notifications"
    },
    settings: {
      title: "Settings"
    }
  },
  auth: {
    login: {
      title: "Log in",
      email: "Email",
      password: "Password",
      submit: "Log in",
      forgotPassword: "Forgot your password?",
      noAccount: "Don't have an account?",
      register: "Sign up"
    },
    register: {
      title: "Create account",
      name: "Full name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      submit: "Create account",
      hasAccount: "Already have an account?",
      login: "Log in"
    }
  },
  community: {
    title: "Community"
  }
};

const translations: Record<Locale, TranslationContent> = { es, en };

function getNestedValue(obj: TranslationContent, path: string): string {
  const keys = path.split('.');
  let value: any = obj;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return path;
    }
  }
  
  return typeof value === 'string' ? value : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cookies = document.cookie.split('; ');
    const localeCookie = cookies.find(row => row.startsWith('locale='));
    const saved = localeCookie?.split('=')[1];
    
    if (saved === 'es' || saved === 'en') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
  };

  const t = (key: string): string => {
    if (!mounted) return key;
    
    let result = getNestedValue(translations[locale], key);
    
    if (result === key) {
      result = getNestedValue(translations.es, key);
    }
    
    return result;
  };

  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: 'es', setLocale: () => {}, t: (key) => key }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}