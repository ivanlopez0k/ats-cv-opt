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
  { value: 'junior', label: 'Junior / Trainee' },
  { value: 'mid', label: 'Semi-Senior' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Manager' },
];

const OPTIMIZATION_FOCUSES = [
  { value: 'technical', label: 'Experiencia técnica', icon: '💻' },
  { value: 'soft', label: 'Habilidades blandas', icon: '🤝' },
  { value: 'both', label: 'Ambas', icon: '⚡' },
  { value: 'career-change', label: 'Cambio de carrera', icon: '🔄' },
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
      if (selectedFile.type !== 'application/pdf') { toast.error('Solo se aceptan archivos PDF'); return; }
      if (selectedFile.size > 10 * 1024 * 1024) { toast.error('El archivo debe ser menor a 10MB'); return; }
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace('.pdf', ''));
    }
  }, [title]);

  const handleSubmit = async () => {
    if (!file || !title.trim()) { toast.error('Subí un archivo PDF y poné un título'); return; }
    if (!context.targetJob.trim()) { toast.error('Decí a qué puesto querés aplicar'); return; }

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
      toast.success('¡CV subido! La IA lo está analizando...');
      setOpen(false);
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al subir el CV');
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
            <Upload className="mr-2 h-4 w-4" /> Subir CV
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-xl bg-card border-border text-foreground" showCloseButton={!isUploading}>
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">
            {isUploading ? 'Procesando tu CV...' : step === 1 ? 'Subí tu CV' : 'Contexto para la IA'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isUploading
              ? 'La IA está analizando y optimizando tu CV'
              : step === 1
                ? 'Arrastrá tu CV en PDF o seleccionalo'
                : 'Respondé para que la IA optimice mejor'}
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
                    Hacé click para <span className="text-foreground font-medium">seleccionar tu PDF</span>
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Máximo 10MB</p>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="modal-title" className="text-foreground">Título *</Label>
              <Input
                id="modal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Mi CV — Desarrollador Full Stack"
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              className="w-full text-background bg-foreground font-semibold hover:bg-foreground/90"
              disabled={!file || !title.trim()}
              onClick={() => setStep(2)}
            >
              Siguiente <Sparkles className="ml-2 h-4 w-4" />
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
                Cambiar
              </Button>
            </div>

            {/* Puesto */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                ¿A qué puesto querés aplicar? *
              </Label>
              <Input
                value={context.targetJob}
                onChange={(e) => setContext(prev => ({ ...prev, targetJob: e.target.value }))}
                placeholder="Ej: Desarrollador Full Stack"
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                ¿A qué empresa? <span className="text-muted-foreground/70 font-normal">(opcional)</span>
              </Label>
              <Input
                value={context.targetCompany}
                onChange={(e) => setContext(prev => ({ ...prev, targetCompany: e.target.value }))}
                placeholder="Ej: Google, MercadoLibre"
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Industria */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                Industria <span className="text-muted-foreground/70 font-normal">(opcional)</span>
              </Label>
              <select
                value={context.targetIndustry}
                onChange={(e) => setContext(prev => ({ ...prev, targetIndustry: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-border bg-muted/50 px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" className="bg-background">Seleccionar...</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind} className="bg-background">{ind}</option>
                ))}
              </select>
            </div>

            {/* Nivel */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                Nivel de experiencia *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setContext(prev => ({ ...prev, experienceLevel: level.value }))}
                    className={`p-2 rounded-lg border text-center text-sm transition-all ${
                      context.experienceLevel === level.value
                        ? 'border-border/80 bg-secondary'
                        : 'border-border bg-muted hover:bg-muted'
                    }`}
                  >
                    <span className="text-foreground">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enfoque */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                Enfoque de optimización
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {OPTIMIZATION_FOCUSES.map((focus) => (
                  <button
                    key={focus.value}
                    type="button"
                    onClick={() => setContext(prev => ({ ...prev, optimizationFocus: focus.value }))}
                    className={`p-2 rounded-lg border text-center text-sm transition-all ${
                      context.optimizationFocus === focus.value
                        ? 'border-border/80 bg-secondary'
                        : 'border-border bg-muted hover:bg-muted'
                    }`}
                  >
                    <span className="text-foreground">{focus.icon} {focus.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                Notas adicionales <span className="text-muted-foreground/70 font-normal">(opcional)</span>
              </Label>
              <textarea
                value={context.additionalNotes}
                onChange={(e) => setContext(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Ej: Destacar experiencia en React..."
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
                Compartir en la comunidad
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1 text-foreground hover:bg-muted" onClick={() => setStep(1)}>
                Volver
              </Button>
              <Button
                className="flex-[2] text-background bg-foreground font-semibold hover:bg-foreground/90"
                disabled={!context.targetJob.trim() || !context.experienceLevel}
                onClick={handleSubmit}
              >
                <Sparkles className="mr-2 h-4 w-4" /> Analizar con IA
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
