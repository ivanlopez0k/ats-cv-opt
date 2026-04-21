'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, FileText, X, Sparkles, Briefcase, Building2, Target, Lightbulb, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { useI18n } from '@/i18n';

const INDUSTRIES = [
  'Tecnología / Software',
  'Finanzas / Banca',
  'Salud / Medicina',
  'Educación',
  'Marketing / Publicidad',
  'Consultoría',
  'Ingeniería',
  'Diseño / Creativo',
  'Ventas / Comercio',
  'Recursos Humanos',
  'Legal / Abogacía',
  'Manufactura / Producción',
  'Gobierno / Sector público',
  'ONG / Sin fines de lucro',
  'Otro',
];

const EXPERIENCE_LEVELS = [
  { value: 'junior', labelKey: 'dashboard.cvList.uploadDialog.experienceLevels.junior' },
  { value: 'mid', labelKey: 'dashboard.cvList.uploadDialog.experienceLevels.mid' },
  { value: 'senior', labelKey: 'dashboard.cvList.uploadDialog.experienceLevels.senior' },
  { value: 'lead', labelKey: 'dashboard.cvList.uploadDialog.experienceLevels.lead' },
];

const OPTIMIZATION_FOCUSES = [
  { value: 'technical', labelKey: 'dashboard.cvList.uploadDialog.optimizationFocuses.technical', icon: '💻' },
  { value: 'soft', labelKey: 'dashboard.cvList.uploadDialog.optimizationFocuses.soft', icon: '🤝' },
  { value: 'both', labelKey: 'dashboard.cvList.uploadDialog.optimizationFocuses.both', icon: '⚡' },
  { value: 'career-change', labelKey: 'dashboard.cvList.uploadDialog.optimizationFocuses.careerChange', icon: '🔄' },
];

interface ContextAnswers {
  targetJob: string;
  targetCompany: string;
  targetIndustry: string;
  experienceLevel: string;
  optimizationFocus: string;
  additionalNotes: string;
}

export function CVUploadDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPublic, setIsPublic] = useState(false);

  const [context, setContext] = useState<ContextAnswers>({
    targetJob: '',
    targetCompany: '',
    targetIndustry: '',
    experienceLevel: '',
    optimizationFocus: 'both',
    additionalNotes: '',
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') { toast.error(t('dashboard.cvList.uploadDialog.toasts.invalidFile')); return; }
      if (selectedFile.size > 10 * 1024 * 1024) { toast.error(t('dashboard.cvList.uploadDialog.toasts.fileTooBig')); return; }
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace('.pdf', ''));
    }
  }, [title, t]);

  const handleSubmit = async () => {
    if (!file || !title.trim()) { toast.error(t('dashboard.cvList.uploadDialog.toasts.missingFields')); return; }
    if (!context.targetJob.trim()) { toast.error(t('dashboard.cvList.uploadDialog.toasts.missingTargetJob')); return; }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);
    formData.append('targetJob', context.targetJob);
    formData.append('targetIndustry', context.targetIndustry);
    formData.append('contextAnswers', JSON.stringify(context));
    formData.append('isPublic', String(isPublic));

    try {
      await apiClient.post('/cvs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });
      toast.success(t('dashboard.cvList.uploadDialog.toasts.uploadSuccess'));
      setOpen(false);
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('dashboard.cvList.uploadDialog.toasts.uploadError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isUploading) {
      setOpen(newOpen);
      if (!newOpen) {
        setStep(1);
        setIsPublic(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <div onClick={() => !isUploading && setOpen(true)}>{trigger}</div>
      ) : (
        <DialogTrigger>
          <Button className="text-background bg-foreground font-medium hover:bg-foreground/90">
            <Upload className="mr-2 h-4 w-4" /> {t('dashboard.cvList.uploadDialog.trigger')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-xl bg-card border-border text-foreground" showCloseButton={!isUploading}>
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">
            {isUploading ? t('dashboard.cvList.uploadDialog.dialogTitle.uploading') : step === 1 ? t('dashboard.cvList.uploadDialog.dialogTitle.step1') : t('dashboard.cvList.uploadDialog.dialogTitle.step2')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isUploading
              ? t('dashboard.cvList.uploadDialog.description.uploading')
              : step === 1
                ? t('dashboard.cvList.uploadDialog.description.step1')
                : t('dashboard.cvList.uploadDialog.description.step2')}
          </DialogDescription>
        </DialogHeader>

        {isUploading ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-foreground animate-spin" />
            </div>
            <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">{uploadProgress}%</p>
          </div>
        ) : step === 1 ? (
          <div className="space-y-4">
            {/* Drop Zone / File Input */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-border hover:bg-muted transition-all cursor-pointer"
              onClick={() => document.getElementById('modal-file-upload')?.click()}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="modal-file-upload"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-green-400" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground shrink-0"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground/70 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.cvList.uploadDialog.dropzone.clickToSelect')} <span className="text-foreground font-medium">{t('dashboard.cvList.uploadDialog.dropzone.selectPdf')}</span>
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{t('dashboard.cvList.uploadDialog.dropzone.maxSize')}</p>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="modal-title" className="text-foreground">{t('dashboard.cvList.uploadDialog.cvTitle.label')}</Label>
              <Input
                id="modal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('dashboard.cvList.uploadDialog.cvTitle.placeholder')}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              className="w-full text-background bg-foreground font-semibold hover:bg-foreground/90"
              disabled={!file || !title.trim()}
              onClick={() => setStep(2)}
            >
              {t('dashboard.cvList.uploadDialog.next')} <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{file?.name}</p>
                <p className="text-xs text-muted-foreground/70">{file ? (file.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
              </div>
<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground shrink-0" onClick={() => setStep(1)}>
                {t('dashboard.cvList.uploadDialog.step2.changeFile')}
              </Button>
            </div>

            {/* Puesto */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.cvList.uploadDialog.step2.targetJob.label')}
              </Label>
              <Input
                value={context.targetJob}
                onChange={(e) => setContext(prev => ({ ...prev, targetJob: e.target.value }))}
                placeholder={t('dashboard.cvList.uploadDialog.step2.targetJob.placeholder')}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.cvList.uploadDialog.step2.targetCompany.label')} <span className="text-muted-foreground/70 font-normal">{t('dashboard.cvList.uploadDialog.step2.targetCompany.optional')}</span>
              </Label>
              <Input
                value={context.targetCompany}
                onChange={(e) => setContext(prev => ({ ...prev, targetCompany: e.target.value }))}
                placeholder={t('dashboard.cvList.uploadDialog.step2.targetCompany.placeholder')}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Industria */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.cvList.uploadDialog.step2.industry.label')} <span className="text-muted-foreground/70 font-normal">{t('dashboard.cvList.uploadDialog.step2.industry.optional')}</span>
              </Label>
              <select
                value={context.targetIndustry}
                onChange={(e) => setContext(prev => ({ ...prev, targetIndustry: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-border bg-muted/50 px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" className="bg-background">{t('dashboard.cvList.uploadDialog.step2.industry.selectPlaceholder')}</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind} className="bg-background">{ind}</option>
                ))}
              </select>
            </div>

            {/* nivel */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.cvList.uploadDialog.step2.experienceLevel.label')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setContext(prev => ({ ...prev, experienceLevel: level.value }))}
                    className={`p-2 rounded-lg border-2 text-center text-sm transition-all ${
                      context.experienceLevel === level.value
                        ? 'border-foreground bg-foreground/10 text-foreground font-semibold ring-1 ring-foreground/20'
                        : 'border-border bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {t(level.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Enfoque */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.cvList.uploadDialog.step2.optimizationFocus.label')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {OPTIMIZATION_FOCUSES.map((focus) => (
                  <button
                    key={focus.value}
                    type="button"
                    onClick={() => setContext(prev => ({ ...prev, optimizationFocus: focus.value }))}
                    className={`p-2 rounded-lg border-2 text-center text-sm transition-all ${
                      context.optimizationFocus === focus.value
                        ? 'border-foreground bg-foreground/10 text-foreground font-semibold ring-1 ring-foreground/20'
                        : 'border-border bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                    }`}
                  >
                    {focus.icon} {t(focus.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                {t('dashboard.cvList.uploadDialog.step2.additionalNotes.label')} <span className="text-muted-foreground/70 font-normal">{t('dashboard.cvList.uploadDialog.step2.additionalNotes.optional')}</span>
              </Label>
              <textarea
                value={context.additionalNotes}
                onChange={(e) => setContext(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder={t('dashboard.cvList.uploadDialog.step2.additionalNotes.placeholder')}
                rows={2}
                className="flex w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Share with community */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <input
                type="checkbox"
                id="share-community"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-border text-foreground focus:ring-ring focus:ring-offset-0"
              />
              <Label htmlFor="share-community" className="text-foreground text-sm cursor-pointer">
                {t('dashboard.cvList.uploadDialog.step2.shareCommunity')}
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1 text-foreground hover:bg-muted" onClick={() => setStep(1)}>
                {t('dashboard.cvList.uploadDialog.back')}
              </Button>
              <Button
                className="flex-[2] text-background bg-foreground font-semibold hover:bg-foreground/90"
                disabled={!context.targetJob.trim() || !context.experienceLevel}
                onClick={handleSubmit}
              >
                <Sparkles className="mr-2 h-4 w-4" /> {t('dashboard.cvList.uploadDialog.submit')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Progress({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-secondary rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className="h-full bg-foreground rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
