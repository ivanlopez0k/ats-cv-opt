'use client';

import { useState, useRef } from 'react';
import { Camera, X, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/stores/authStore';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({ size = 'lg' }: AvatarUploadProps) {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await apiClient.patch('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser({ avatarUrl: response.data.data.avatarUrl || undefined });
      toast.success('Avatar actualizado');
      setShowDialog(false);
      setPreview(null);
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al subir el avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await apiClient.delete('/auth/avatar');
      updateUser({ avatarUrl: undefined });
      toast.success('Avatar eliminado');
      setShowDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar el avatar');
    }
  };

  return (
    <>
      <div className="relative inline-block">
        <Avatar className={`${sizeClasses[size]} cursor-pointer`}>
          <AvatarImage src={user?.avatarUrl || undefined} />
          <AvatarFallback className="text-lg bg-foreground text-background">{initials}</AvatarFallback>
        </Avatar>
        {size === 'lg' && (
          <button
            type="button"
            onClick={() => setShowDialog(true)}
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors shadow-lg"
          >
            <Camera className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Avatar Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Foto de perfil</DialogTitle>
            <DialogDescription>
              Subí una foto para tu perfil. Se redimensionará a 256x256.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {/* Current/Preview Avatar */}
            <Avatar className="h-32 w-32">
              <AvatarImage src={preview || user?.avatarUrl || undefined} />
              <AvatarFallback className="text-3xl bg-foreground text-background">{initials}</AvatarFallback>
            </Avatar>

            {/* File info */}
            {selectedFile && (
              <div className="text-center">
                <p className="text-sm text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="mr-2 h-4 w-4" />
                {user?.avatarUrl ? 'Cambiar' : 'Seleccionar'}
              </Button>
              {user?.avatarUrl && (
                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isUploading}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {preview && (
            <DialogFooter>
              <Button variant="outline" onClick={() => { setPreview(null); setSelectedFile(null); }} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Subiendo...' : 'Guardar'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
