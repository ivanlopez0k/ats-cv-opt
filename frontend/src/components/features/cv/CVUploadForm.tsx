'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, FileText, X, ArrowRight, ArrowLeft, Sparkles, Briefcase, Building2, Target, Lightbulb, FileQuestion, CheckCircle2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  { value: 'junior', label: 'Junior / Trainee', desc: '0-2 años de experiencia' },
  { value: 'mid', label: 'Semi-Senior', desc: '2-5 años de experiencia' },
  { value: 'senior', label: 'Senior', desc: '5-10 años de experiencia' },
  { value: 'lead', label: 'Lead / Manager', desc: '10+ años o gestión de equipos' },
];

const OPTIMIZATION_FOCUSES = [
  { value: 'technical', label: 'Experiencia técnica', icon: '💻', desc: 'Destacar habilidades técnicas y proyectos' },
  { value: 'soft', label: 'Habilidades blandas', icon: '🤝', desc: 'Liderazgo, comunicación, trabajo en equipo' },
  { value: 'both', label: 'Ambas', icon: '⚡', desc: 'Balance entre técnica y habilidades blandas' },
  { value: 'career-change', label: 'Cambio de carrera', icon: '🔄', desc: 'Transición a un nuevo rol o industria' },
];

const TEMPLATES = [
  { value: 'MODERN', label: 'Moderno', desc: 'Diseño profesional de dos columnas', preview: '💙' },
  { value: 'CLASSIC', label: 'Clásico', desc: 'Estilo tradicional y elegante', preview: '📋' },
  { value: 'MINIMAL', label: 'Minimalista', desc: 'Limpio y moderno', preview: '⚪' },
];

type Step = 'upload' | 'context' | 'template' | 'uploading';

interface ContextAnswers {
  targetJob: string;
  targetCompany: string;
  targetIndustry: string;
  experienceLevel: string;
  optimizationFocus: string;
  additionalNotes: string;
}

export function CVUploadForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('MODERN');

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

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragOver if we're dragging files
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if we're actually leaving the drop zone (not entering a child)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    // Check if we're outside the bounds
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Set drop effect
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') { toast.error('Solo se aceptan archivos PDF'); return; }
      if (droppedFile.size > 10 * 1024 * 1024) { toast.error('El archivo debe ser menor a 10MB'); return; }
      setFile(droppedFile);
      if (!title) setTitle(droppedFile.name.replace('.pdf', ''));
    }
  }, [title]);

  const canProceedToContext = file && title.trim().length > 0;
  const canSubmit = context.targetJob.trim().length > 0 && context.experienceLevel.length > 0;

  const handleSubmit = async () => {
    setStep('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('pdf', file!);
    formData.append('title', title);
    formData.append('targetJob', context.targetJob);
    formData.append('targetIndustry', context.targetIndustry);
    formData.append('template', selectedTemplate);
    formData.append('contextAnswers', JSON.stringify(context));

    try {
      await apiClient.post('/cvs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });
      toast.success('¡CV subido! La IA lo está analizando...');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al subir el CV');
      setStep('context');
    }
  };

  // ============================================================
  // STEP 1: Upload
  // ============================================================
  if (step === 'upload') {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Subí tu CV</CardTitle>
          <CardDescription className="text-gray-400">Arrastrá tu CV en PDF o seleccionalo manualmente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drop Zone */}
          <label htmlFor="file-upload" className="block">
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
                isDragOver
                  ? 'border-white/40 bg-white/10 scale-[1.02]'
                  : file
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="file-upload" />

            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white text-lg">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white mt-1"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setTitle(''); }}
                >
                  <X className="h-4 w-4 mr-1" /> Quitar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-300">
                    Arrastrá tu CV acá o <span className="text-white font-medium underline">buscá en tu computadora</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Solo PDF — máximo 10MB</p>
                </div>
              </div>
            )}
          </div>
          </label>

          {/* Title */}
          {file && (
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Título del CV *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Mi CV — Desarrollador Full Stack"
                className="bg-black/40 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          )}

          {/* Next Button */}
          <Button
            className="w-full bg-white text-black font-semibold hover:bg-gray-200 shadow-lg shadow-white/10 h-12 text-base"
            disabled={!canProceedToContext}
            onClick={() => setStep('context')}
          >
            Continuar <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ============================================================
  // STEP 2: Context Questions
  // ============================================================
  if (step === 'context') {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl">Contexto para la IA</CardTitle>
              <CardDescription className="text-gray-400">Respondé estas preguntas para que la IA optimice mejor tu CV</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
              <Sparkles className="h-3 w-3 mr-1" /> Paso 2 de 3
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <FileText className="h-5 w-5 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{file?.name}</p>
              <p className="text-xs text-gray-500">{file ? (file.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white shrink-0" onClick={() => setStep('upload')}>
              Cambiar
            </Button>
          </div>

          {/* Q1: Target Job (required) */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-400" />
              ¿A qué puesto querés aplicar? *
            </Label>
            <Input
              value={context.targetJob}
              onChange={(e) => setContext(prev => ({ ...prev, targetJob: e.target.value }))}
              placeholder="Ej: Desarrollador Full Stack, Data Scientist, Product Manager"
              className="bg-black/40 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Q2: Target Company */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              ¿A qué empresa va dirigido? <span className="text-gray-500 font-normal">(opcional)</span>
            </Label>
            <Input
              value={context.targetCompany}
              onChange={(e) => setContext(prev => ({ ...prev, targetCompany: e.target.value }))}
              placeholder="Ej: Google, MercadoLibre, Accenture"
              className="bg-black/40 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Q3: Industry */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              ¿A qué industria/sector pertenece? <span className="text-gray-500 font-normal">(opcional)</span>
            </Label>
            <select
              value={context.targetIndustry}
              onChange={(e) => setContext(prev => ({ ...prev, targetIndustry: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            >
              <option value="" className="bg-black">Seleccionar industria...</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind} className="bg-black">{ind}</option>
              ))}
            </select>
          </div>

          {/* Q4: Experience Level */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-gray-400" />
              ¿Cuál es tu nivel de experiencia? *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setContext(prev => ({ ...prev, experienceLevel: level.value }))}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    context.experienceLevel === level.value
                      ? 'border-white/40 bg-white/10 shadow-md'
                      : 'border-white/10 bg-black/20 hover:bg-white/5'
                  }`}
                >
                  <p className="text-sm font-medium text-white">{level.label}</p>
                  <p className="text-xs text-gray-400">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Q5: Optimization Focus */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-gray-400" />
              ¿Qué querés destacar en tu CV?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {OPTIMIZATION_FOCUSES.map((focus) => (
                <button
                  key={focus.value}
                  type="button"
                  onClick={() => setContext(prev => ({ ...prev, optimizationFocus: focus.value }))}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    context.optimizationFocus === focus.value
                      ? 'border-white/40 bg-white/10 shadow-md'
                      : 'border-white/10 bg-black/20 hover:bg-white/5'
                  }`}
                >
                  <p className="text-sm font-medium text-white">{focus.icon} {focus.label}</p>
                  <p className="text-xs text-gray-400">{focus.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Q6: Additional Notes */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-gray-400" />
              ¿Hay algo específico que quieras mejorar? <span className="text-gray-500 font-normal">(opcional)</span>
            </Label>
            <textarea
              value={context.additionalNotes}
              onChange={(e) => setContext(prev => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Ej: Quiero que destaque más mi experiencia en liderazgo de equipos, o que agregue keywords de React y Node.js..."
              rows={3}
              className="flex w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 resize-none"
            />
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 text-white hover:bg-white/10 h-12"
              onClick={() => setStep('upload')}
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Volver
            </Button>
            <Button
              className="flex-[2] bg-white text-black font-semibold hover:bg-gray-200 shadow-lg shadow-white/10 h-12 text-base"
              disabled={!canSubmit}
              onClick={() => setStep('template')}
            >
              Continuar <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================
  // STEP 3: Template Selection
  // ============================================================
  if (step === 'template') {
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl">Elegí tu plantilla</CardTitle>
              <CardDescription className="text-gray-400">Seleccioná el estilo visual para tu CV mejorado</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
              <Sparkles className="h-3 w-3 mr-1" /> Paso 3 de 3
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <FileText className="h-5 w-5 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{file?.name}</p>
              <p className="text-xs text-gray-500">{title}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white shrink-0" onClick={() => setStep('context')}>
              Cambiar
            </Button>
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-400" />
              ¿Qué estilo preferís?
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setSelectedTemplate(t.value)}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    selectedTemplate === t.value
                      ? 'border-white/40 bg-white/10 shadow-md'
                      : 'border-white/10 bg-black/20 hover:bg-white/5'
                  }`}
                >
                  <p className="text-2xl mb-2">{t.preview}</p>
                  <p className="text-sm font-medium text-white">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 text-white hover:bg-white/10 h-12"
              onClick={() => setStep('context')}
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Volver
            </Button>
            <Button
              className="flex-[2] bg-white text-black font-semibold hover:bg-gray-200 shadow-lg shadow-white/10 h-12 text-base"
              onClick={handleSubmit}
            >
              <Sparkles className="mr-2 h-5 w-5" /> Analizar y Mejorar con IA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================
  // STEP 4: Uploading
  // ============================================================
  return (
    <Card className="glass-card">
      <CardContent className="py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          {uploadProgress >= 100 ? (
            <CheckCircle2 className="h-10 w-10 text-green-400" />
          ) : (
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {uploadProgress >= 100 ? '¡CV subido!' : 'Subiendo tu CV...'}
        </h3>
        <p className="text-gray-400 mb-6">
          {uploadProgress >= 100
            ? 'La IA está analizando y optimizando tu CV'
            : 'Esto puede tomar unos momentos'}
        </p>
        <Progress value={uploadProgress} className="max-w-md mx-auto h-2" />
        <p className="text-sm text-gray-500 mt-3">{uploadProgress}%</p>
      </CardContent>
    </Card>
  );
}
