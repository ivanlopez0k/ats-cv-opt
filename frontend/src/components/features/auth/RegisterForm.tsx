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
      if (response.data.available) {
        setUsernameStatus('available');
        setUsernameError('');
      } else {
        setUsernameStatus('taken');
        setUsernameError(response.data.error || 'El username no está disponible');
      }
    } catch {
      setUsernameStatus('error');
      setUsernameError('Error al verificar el username');
    }
  }, []);

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
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('¡Cuenta creada!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-white">Crear Cuenta</CardTitle>
        <CardDescription className="text-center text-gray-400">Completá tus datos para empezar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">Username *</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder="tu_nombre"
                {...register('username')}
                onChange={handleUsernameChange}
                className={`bg-black/40 border-white/10 text-white placeholder:text-gray-500 pr-10 ${
                  usernameStatus === 'available' ? 'border-green-500/50' :
                  usernameStatus === 'taken' ? 'border-red-500/50' : ''
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />}
                {usernameStatus === 'available' && <Check className="h-4 w-4 text-green-400" />}
                {usernameStatus === 'taken' && <X className="h-4 w-4 text-red-400" />}
              </div>
            </div>
            {errors.username && <p className="text-sm text-red-400">{errors.username.message}</p>}
            {usernameStatus === 'available' && <p className="text-sm text-green-400">Username disponible</p>}
            {usernameStatus === 'taken' && <p className="text-sm text-red-400">{usernameError}</p>}
            {usernameStatus === 'error' && <p className="text-sm text-yellow-400">{usernameError}</p>}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Nombre *</Label>
            <Input id="name" type="text" placeholder="Juan Pérez" {...register('name')} className="bg-black/40 border-white/10 text-white placeholder:text-gray-500" />
            {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email *</Label>
            <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} className="bg-black/40 border-white/10 text-white placeholder:text-gray-500" />
            {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Contraseña *</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 pr-10" />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
          </div>

          {/* Nationality (optional) */}
          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-white">Nacionalidad <span className="text-gray-500">(opcional)</span></Label>
            <select
              id="nationality"
              {...register('nationality')}
              className="flex h-9 w-full rounded-md border border-white/10 bg-black/40 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            >
              <option value="" className="bg-black">Seleccionar...</option>
              {NATIONALITIES.map((n) => (
                <option key={n} value={n} className="bg-black">{n}</option>
              ))}
            </select>
          </div>

          {/* Default Target Job (optional) */}
          <div className="space-y-2">
            <Label htmlFor="defaultTargetJob" className="text-white">Puesto objetivo <span className="text-gray-500">(opcional)</span></Label>
            <Input id="defaultTargetJob" placeholder="Ej: Desarrollador Full Stack" {...register('defaultTargetJob')} className="bg-black/40 border-white/10 text-white placeholder:text-gray-500" />
          </div>

          {/* Default Target Industry (optional) */}
          <div className="space-y-2">
            <Label htmlFor="defaultTargetIndustry" className="text-white">Industria <span className="text-gray-500">(opcional)</span></Label>
            <Input id="defaultTargetIndustry" placeholder="Ej: Tecnología" {...register('defaultTargetIndustry')} className="bg-black/40 border-white/10 text-white placeholder:text-gray-500" />
          </div>

          <Button type="submit" className="w-full bg-white text-black font-semibold hover:bg-gray-200 shadow-lg shadow-white/10" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</> : 'Crear Cuenta'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-400">¿Ya tienes cuenta?</span> <a href="/login" className="text-white hover:underline font-medium">Inicia sesión</a>
        </div>
      </CardContent>
    </Card>
  );
}
