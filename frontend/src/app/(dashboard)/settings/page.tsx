'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

const profileSchema = z.object({ name: z.string().min(2) });
export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name || '' } });

  const onSubmit = async (data: { name: string }) => { setIsLoading(true); try { const response = await apiClient.patch('/auth/profile', data); updateUser(response.data.data); toast.success('Actualizado'); } catch (e: any) { toast.error(e.response?.data?.error || 'Error'); } finally { setIsLoading(false); } };
  const initials = user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Configuración</h1>
        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader><CardTitle className="text-foreground">Perfil</CardTitle><CardDescription className="text-muted-foreground">Tu información</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex items-center gap-4 mb-6"><Avatar className="h-20 w-20"><AvatarFallback className="text-xl bg-foreground text-background">{initials}</AvatarFallback></Avatar></div>
                <div className="space-y-2"><Label htmlFor="name" className="text-foreground">Nombre</Label><Input id="name" {...register('name')} className="bg-muted/50 border-border text-foreground" />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
                <div className="space-y-2"><Label className="text-foreground">Email</Label><Input value={user?.email} disabled className="bg-muted/50 border-border text-muted-foreground" /><p className="text-sm text-muted-foreground">No se puede cambiar</p></div>
                <Button type="submit" disabled={isLoading} className="bg-foreground text-background font-medium hover:bg-foreground/90">{isLoading ? 'Guardando...' : 'Guardar'}</Button>
              </form>
            </CardContent>
          </Card>
          <Card className="bg-card border-destructive/30"><CardHeader><CardTitle className="text-destructive">Zona de peligro</CardTitle><CardDescription className="text-muted-foreground">Acciones irreversibles</CardDescription></CardHeader><CardContent><Button variant="destructive" onClick={() => { logout(); router.push('/login'); }}>Cerrar sesión</Button></CardContent></Card>
        </div>
      </main>
    </div>
  );
}
