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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, AtSign, Globe, Briefcase, Building2, Shield, LogOut } from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

const NATIONALITIES = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
  'Cuba', 'Ecuador', 'El Salvador', 'España', 'Guatemala', 'Honduras',
  'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'República Dominicana',
  'Uruguay', 'Venezuela', 'Estados Unidos', 'Otro',
];

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

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [nationality, setNationality] = useState(user?.nationality || '');
  const [defaultTargetJob, setDefaultTargetJob] = useState(user?.defaultTargetJob || '');
  const [defaultTargetIndustry, setDefaultTargetIndustry] = useState(user?.defaultTargetIndustry || '');

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleSaveProfile = async () => {
    if (!name.trim() || name.length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.patch('/auth/profile', {
        name,
        username: username.trim() || undefined,
        nationality: nationality || undefined,
        defaultTargetJob: defaultTargetJob || undefined,
        defaultTargetIndustry: defaultTargetIndustry || undefined,
      });
      updateUser(response.data.data);
      toast.success('Perfil actualizado');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Error al actualizar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Configuración</h1>
        <p className="text-muted-foreground mb-8">Gestioná tu perfil y preferencias</p>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border-border">
            <TabsTrigger value="profile" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
              <User className="mr-2 h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="workspace" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
              <Briefcase className="mr-2 h-4 w-4" /> Área de trabajo
            </TabsTrigger>
            <TabsTrigger value="security" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
              <Shield className="mr-2 h-4 w-4" /> Seguridad
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Información personal</CardTitle>
                <CardDescription className="text-muted-foreground">Datos básicos de tu perfil público</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-xl bg-foreground text-background">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">@{user?.username}</p>
                    {user?.isPremium && <span className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded-full mt-1 inline-block">Premium</span>}
                  </div>
                </div>

                <Separator />

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Nombre completo
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground flex items-center gap-2">
                    <AtSign className="h-4 w-4 text-muted-foreground" /> Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="juan_perez"
                    className="bg-muted/50 border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Se muestra en tu perfil público</p>
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label className="text-foreground">Email</Label>
                  <Input value={user?.email} disabled className="bg-muted/50 border-border text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">No se puede cambiar</p>
                </div>

                {/* Nationality */}
                <div className="space-y-2">
                  <Label htmlFor="nationality" className="text-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" /> Nacionalidad <span className="text-muted-foreground/70 font-normal">(opcional)</span>
                  </Label>
                  <select
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-border bg-muted/50 px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Seleccionar...</option>
                    {NATIONALITIES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <Button onClick={handleSaveProfile} disabled={isLoading} className="bg-foreground text-background font-medium hover:bg-foreground/90">
                  {isLoading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workspace Tab */}
          <TabsContent value="workspace">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Área de trabajo</CardTitle>
                <CardDescription className="text-muted-foreground">Tu información laboral por defecto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Target Job */}
                <div className="space-y-2">
                  <Label htmlFor="defaultTargetJob" className="text-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" /> Puesto objetivo <span className="text-muted-foreground/70 font-normal">(opcional)</span>
                  </Label>
                  <Input
                    id="defaultTargetJob"
                    value={defaultTargetJob}
                    onChange={(e) => setDefaultTargetJob(e.target.value)}
                    placeholder="Ej: Desarrollador Full Stack"
                    className="bg-muted/50 border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Se usará como valor por defecto al subir un nuevo CV</p>
                </div>

                {/* Default Target Industry */}
                <div className="space-y-2">
                  <Label htmlFor="defaultTargetIndustry" className="text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" /> Industria <span className="text-muted-foreground/70 font-normal">(opcional)</span>
                  </Label>
                  <select
                    id="defaultTargetIndustry"
                    value={defaultTargetIndustry}
                    onChange={(e) => setDefaultTargetIndustry(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-border bg-muted/50 px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Seleccionar...</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <Button onClick={handleSaveProfile} disabled={isLoading} className="bg-foreground text-background font-medium hover:bg-foreground/90">
                  {isLoading ? 'Guardando...' : 'Guardar área de trabajo'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-card border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2"><LogOut className="h-5 w-5" /> Cerrar sesión</CardTitle>
                <CardDescription className="text-muted-foreground">Salí de tu cuenta en este dispositivo</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={() => { logout(); router.push('/login'); }}>Cerrar sesión</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
