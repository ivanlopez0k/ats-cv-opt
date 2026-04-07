'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export function CVUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') { toast.error('Solo PDF'); return; }
      if (selectedFile.size > 10 * 1024 * 1024) { toast.error('Máx 10MB'); return; }
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace('.pdf', ''));
    }
  }, [title]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      if (!title) setTitle(droppedFile.name.replace('.pdf', ''));
    }
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) { toast.error('Completa los campos'); return; }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);
    if (targetJob) formData.append('targetJob', targetJob);
    if (targetIndustry) formData.append('targetIndustry', targetIndustry);

    try {
      await apiClient.post('/cvs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });
      toast.success('CV subido! Procesando...');
      router.push('/dashboard/cvs');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir tu CV</CardTitle>
        <CardDescription>La IA lo optimizará para ATS</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-10 w-10 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); setFile(null); }}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <><Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">Arrastra tu CV o <span className="text-primary font-medium">busca</span></p></>
              )}
            </label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mi CV" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetJob">Puesto objetivo</Label>
              <Input id="targetJob" value={targetJob} onChange={(e) => setTargetJob(e.target.value)} placeholder="Developer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetIndustry">Industria</Label>
              <Input id="targetIndustry" value={targetIndustry} onChange={(e) => setTargetIndustry(e.target.value)} placeholder="Tech" />
            </div>
          </div>
          {isUploading && <div className="space-y-2"><div className="flex justify-between text-sm"><span>Subiendo...</span><span>{uploadProgress}%</span></div><Progress value={uploadProgress} /></div>}
          <Button type="submit" className="w-full" disabled={isUploading || !file}>
            {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</> : <><Upload className="mr-2 h-4 w-4" />Subir y Analizar</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
