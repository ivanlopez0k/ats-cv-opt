'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { useAuthStore } from '@/lib/stores/authStore';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { useI18n } from '@/i18n';

const NATIONALITIES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
  'Cuba', 'Ecuador', 'El Salvador', 'España', 'Guatemala', 'Honduras',
  'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'República Dominicana',
  'Uruguay', 'Venezuela', 'Estados Unidos', 'Otro',
];

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | 'error' | null>(null);
  const [usernameError, setUsernameError] = useState<string>('');
  const { t } = useI18n();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const usernameValue = watch('username');

  // Debounced username availability check
  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      setUsernameError('');
      return;
    }

    setUsernameStatus('checking');
    try {
      const response = await apiClient.get(`/auth/check-username/${encodeURIComponent(username)}`);
      // Backend returns { success: true, data: { available: boolean } }
      const isAvailable = response.data.data?.available;
      if (isAvailable) {
        setUsernameStatus('available');
        setUsernameError('');
      } else {
        setUsernameStatus('taken');
        setUsernameError(response.data.data?.error || t('auth.register.usernameTaken'));
      }
    } catch {
      setUsernameStatus('error');
      setUsernameError(t('auth.register.usernameCheckError'));
    }
  }, [t]);

  // Debounce effect
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => checkUsername(value), 500);
    setDebounceTimer(timer);
  }, [checkUsername, debounceTimer]);

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', data);
      const { user, accessToken, refreshToken, emailVerificationRequired } = response.data.data;
      setAuth(user, accessToken, refreshToken);

      if (emailVerificationRequired) {
        toast.success(t('auth.verifyEmail.sent.title'));
        router.push('/auth/verify-email?sent=true');
      } else {
        toast.success(t('auth.login.welcome'));
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-foreground">{t('auth.register.title')}</CardTitle>
        <CardDescription className="text-center text-muted-foreground">{t('auth.register.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">{t('auth.register.username')}</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder={t('auth.register.usernamePlaceholder')}
                {...register('username')}
                onChange={handleUsernameChange}
                className={`bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pr-10 ${
                  usernameStatus === 'available' ? 'border-emerald-500/50' :
                  usernameStatus === 'taken' ? 'border-destructive/50' : ''
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />}
                {usernameStatus === 'available' && <Check className="h-4 w-4 text-emerald-500" />}
                {usernameStatus === 'taken' && <X className="h-4 w-4 text-destructive" />}
              </div>
            </div>
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            {usernameStatus === 'available' && <p className="text-sm text-emerald-500">{t('auth.register.usernameAvailable')}</p>}
            {usernameStatus === 'taken' && <p className="text-sm text-destructive">{usernameError}</p>}
            {usernameStatus === 'error' && <p className="text-sm text-yellow-500">{usernameError}</p>}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">{t('auth.register.name')} *</Label>
            <Input id="name" type="text" placeholder={t('auth.register.namePlaceholder')} {...register('name')} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">{t('auth.register.email')} *</Label>
            <Input id="email" type="email" placeholder={t('auth.common.emailPlaceholder')} {...register('email')} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">{t('auth.register.password')} *</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder={t('auth.common.passwordPlaceholder')} {...register('password')} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pr-10" />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('auth.common.hidePassword') : t('auth.common.showPassword')}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          {/* Nationality (optional) */}
          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-foreground">{t('auth.register.nationality')} <span className="text-muted-foreground/70">{t('auth.register.optional')}</span></Label>
            <select
              id="nationality"
              {...register('nationality')}
              className="flex h-9 w-full rounded-md border border-border bg-muted/50 px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">{t('auth.register.nationalityPlaceholder')}</option>
              {NATIONALITIES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Default Target Job (optional) */}
          <div className="space-y-2">
            <Label htmlFor="defaultTargetJob" className="text-foreground">{t('auth.register.targetJob')} <span className="text-muted-foreground/70">{t('auth.register.optional')}</span></Label>
            <Input id="defaultTargetJob" placeholder={t('auth.register.targetJobPlaceholder')} {...register('defaultTargetJob')} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
          </div>

          {/* Default Target Industry (optional) */}
          <div className="space-y-2">
            <Label htmlFor="defaultTargetIndustry" className="text-foreground">{t('auth.register.industry')} <span className="text-muted-foreground/70">{t('auth.register.optional')}</span></Label>
            <Input id="defaultTargetIndustry" placeholder={t('auth.register.industryPlaceholder')} {...register('defaultTargetIndustry')} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
          </div>

          <Button type="submit" className="w-full bg-foreground text-background font-semibold hover:bg-foreground/90" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('auth.register.creating')}</> : t('auth.register.submit')}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">{t('auth.register.hasAccount')}</span> <a href="/login" className="text-foreground hover:underline font-medium">{t('auth.register.login')}</a>
        </div>
      </CardContent>
    </Card>
  );
}
