'use client';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { CVList } from '@/components/features/cv/CVList';
import { CVUploadDialog } from '@/components/features/cv/CVUploadDialog';
import { Plus } from 'lucide-react';
import { useI18n } from '@/i18n';

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold text-foreground">{t('dashboard.myCvs')}</h1><p className="text-muted-foreground">{t('dashboard.manageCvs')}</p></div>
          <CVUploadDialog trigger={
            <div className="inline-flex items-center px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />{t('dashboard.newCv')}
            </div>
          } />
        </div>
        <CVList />
      </main>
    </div>
  );
}
