'use client';

import { useState } from 'react';
import { AlertTriangle, X, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

interface EmailVerificationBannerProps {
  userEmail: string;
  onVerified: () => void;
}

export function EmailVerificationBanner({ userEmail, onVerified }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await apiClient.post('/auth/resend-verification');
      toast.success('Email de verificación reenviado. Revisá tu bandeja de entrada.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al reenviar email');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Tu email no está verificado.</strong>
                <span className="hidden sm:inline"> Revisá tu bandeja de entrada y hacé click en el link de verificación.</span>
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5 truncate">
                {userEmail}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Reenviando</>
              ) : (
                <><Mail className="mr-1 h-3 w-3" /> Reenviar email</>
              )}
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
