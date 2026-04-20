'use client';

import { useI18n } from '@/i18n';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const toggle = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="flex items-center gap-2"
      title={t('landing.header.switch')}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium uppercase">{locale}</span>
    </Button>
  );
}