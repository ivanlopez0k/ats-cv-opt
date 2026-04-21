'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sent = searchParams.get('sent') === 'true';
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-verify if token is present
  useEffect(() => {
    if (token && !isVerifying && verificationStatus === 'idle') {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;

    setIsVerifying(true);
    try {
      await apiClient.get(`/auth/verify-email/${token}`);
      setVerificationStatus('success');
      toast.success('Email verificado exitosamente!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      setVerificationStatus('error');
      setErrorMessage(error.response?.data?.error || 'Token inválido o expirado');
      toast.error('No se pudo verificar el email');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerificationEmail = async () => {
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

  // State: Token is being verified
  if (token && isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">Verificando tu email...</h2>
            <p className="text-muted-foreground">Esto tomará un momento</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State: Verification successful
  if (token && verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-foreground">¡Email verificado!</CardTitle>
            <CardDescription>
              Tu email fue verificado exitosamente. Ya podés iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Serás redirigido al login en unos segundos...
            </p>
            <Link href="/login">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Ir al login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State: Verification failed
  if (token && verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl text-foreground">No se pudo verificar</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              onClick={resendVerificationEmail}
              disabled={isResending}
            >
              {isResending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reenviando...</>
              ) : (
                <><Mail className="mr-2 h-4 w-4" /> Reenviar email de verificación</>
              )}
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State: Just sent verification email (sent=true)
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Mail className="h-10 w-10 text-foreground" />
            </div>
            <CardTitle className="text-2xl text-foreground">Revisá tu email</CardTitle>
            <CardDescription>
              Te enviamos un link de verificación. Hacé click en el link para activar tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
              💡 El enlace expira en 24 horas. Revisá también tu carpeta de spam.
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={resendVerificationEmail}
              disabled={isResending}
            >
              {isResending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reenviando...</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" /> Reenviar email</>
              )}
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback: No token and not sent - redirect to login
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No se encontró un token de verificación</p>
          <Link href="/login">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" /> Ir al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
