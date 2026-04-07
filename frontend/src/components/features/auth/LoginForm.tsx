'use client';

import { useState } from 'react';
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

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Bienvenido!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-white">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center text-gray-400">Ingresa tus credenciales</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} className="bg-black/40 border-white/10 text-white placeholder:text-gray-500" />
            {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Contraseña</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className="bg-black/40 border-white/10 text-white placeholder:text-gray-500" />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-white text-black font-semibold hover:bg-gray-200 shadow-lg shadow-white/10">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Ingresando...</> : 'Iniciar Sesión'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-400">¿No tienes cuenta?</span> <a href="/register" className="text-white hover:underline font-medium">Regístrate</a>
        </div>
      </CardContent>
    </Card>
  );
}
