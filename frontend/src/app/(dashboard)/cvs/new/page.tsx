'use client';

import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { CVUploadForm } from '@/components/features/cv/CVUploadForm';
import { useI18n } from '@/i18n';

export default function NewCVPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-foreground">{t('dashboard.cvList.uploadDialog.title.step1')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('dashboard.cvList.uploadDialog.description.step1')}
        </p>
        <CVUploadForm />
      </main>
    </div>
  );
}
