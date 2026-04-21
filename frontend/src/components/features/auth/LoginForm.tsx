'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { useAuthStore } from '@/lib/stores/authStore';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { useI18n } from '@/i18n';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(t('auth.login.welcome'));
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-foreground">{t('auth.login.title')}</CardTitle>
        <CardDescription className="text-center text-muted-foreground">{t('auth.login.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">{t('auth.login.email')}</Label>
            <Input id="email" type="email" placeholder={t('auth.common.emailPlaceholder')} {...register('email')} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">{t('auth.login.password')}</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder={t('auth.common.passwordPlaceholder')} {...register('password')} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('auth.common.hidePassword') : t('auth.common.showPassword')}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-foreground text-background font-semibold hover:bg-foreground/90">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('auth.login.loggingIn')}</> : t('auth.login.submit')}
          </Button>
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('auth.login.forgotPassword')}
            </Link>
          </div>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">{t('auth.login.noAccount')}</span> <a href="/register" className="text-foreground hover:underline font-medium">{t('auth.login.register')}</a>
        </div>
      </CardContent>
    </Card>
  );
}
