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
    delete: "Eliminar"
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
      title: "Optimizá tu CV con inteligencia artificial",
      subtitle: "La forma más rápida de crear un CV que pasa los filtros ATS",
      cta: "Subir mi CV gratis"
    },
    cta: {
      title: "Empezá hoy",
      subtitle: "Tu primer CV optimizado en minutos"
    }
  },
  dashboard: {
    stats: { title: "Estadísticas" },
    notifications: { title: "Notificaciones" }
  },
  auth: {
    login: { title: "Iniciar sesión" },
    register: { title: "Crear cuenta" }
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
    delete: "Delete"
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
      title: "Optimize your CV with artificial intelligence",
      subtitle: "The fastest way to create a CV that passes ATS filters",
      cta: "Upload my CV for free"
    },
    cta: {
      title: "Start today",
      subtitle: "Your first optimized CV in minutes"
    }
  },
  dashboard: {
    stats: { title: "Statistics" },
    notifications: { title: "Notifications" }
  },
  auth: {
    login: { title: "Log in" },
    register: { title: "Create account" }
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
    
    // Try current locale first
    let result = getNestedValue(translations[locale], key);
    
    // Fallback to Spanish
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