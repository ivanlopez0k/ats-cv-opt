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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, AtSign, Globe, Briefcase, Building2, Shield, LogOut, Loader2, Trash2, RotateCcw, FileText } from 'lucide-react';
import { AvatarUpload } from '@/components/features/auth/AvatarUpload';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { useDeletedCVs, useRestoreCV } from '@/hooks';
import { useI18n } from '@/i18n';
import type { CV } from '@/lib/types';

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
  const { t } = useI18n();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Deleted CVs state
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const { cvs: deletedCVs, isLoading: loadingDeleted } = useDeletedCVs();
  const restoreMutation = useRestoreCV(() => setShowRestoreDialog(false));

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [nationality, setNationality] = useState(user?.nationality || '');
  const [defaultTargetJob, setDefaultTargetJob] = useState(user?.defaultTargetJob || '');
  const [defaultTargetIndustry, setDefaultTargetIndustry] = useState(user?.defaultTargetIndustry || '');

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleRestore = () => {
    if (selectedCV) {
      restoreMutation.mutate(selectedCV.id);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || name.length < 2) {
      toast.error(t('dashboard.settings.toasts.nameMinLength'));
      return;
    }
    setIsSaving(true);
    try {
      const response = await apiClient.patch('/auth/profile', {
        name,
        nationality: nationality || undefined,
      });
      updateUser(response.data.data);
      toast.success(t('dashboard.settings.toasts.profileUpdated'));
    } catch (e: any) {
      toast.error(e.response?.data?.error || t('dashboard.settings.toasts.errorUpdating'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!username.trim() || username.length < 3) {
      toast.error(t('dashboard.settings.toasts.usernameMinLength'));
      return;
    }
    setIsSavingUsername(true);
    try {
      const response = await apiClient.patch('/auth/username', { username: username.trim() });
      updateUser(response.data.data);
      toast.success(t('dashboard.settings.toasts.usernameUpdated'));
    } catch (e: any) {
      toast.error(e.response?.data?.error || t('dashboard.settings.toasts.errorUpdatingUsername'));
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleSaveWorkspace = async () => {
    setIsSavingWorkspace(true);
    try {
      const response = await apiClient.patch('/auth/profile', {
        defaultTargetJob: defaultTargetJob || undefined,
        defaultTargetIndustry: defaultTargetIndustry || undefined,
      });
      updateUser(response.data.data);
      toast.success(t('dashboard.settings.toasts.workspaceUpdated'));
    } catch (e: any) {
      toast.error(e.response?.data?.error || t('dashboard.settings.toasts.errorUpdating'));
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error(t('dashboard.settings.toasts.enterCurrentPassword'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t('dashboard.settings.toasts.newPasswordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('dashboard.settings.toasts.passwordsMismatch'));
      return;
    }
    setIsChangingPassword(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success(t('dashboard.settings.toasts.passwordUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast.error(e.response?.data?.error || t('dashboard.settings.toasts.errorChangingPassword'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 text-foreground">{t('dashboard.settings.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('dashboard.settings.subtitle')}</p>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border-border">
            <TabsTrigger value="profile" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
              <User className="mr-2 h-4 w-4" /> {t('dashboard.settings.tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="workspace" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
              <Briefcase className="mr-2 h-4 w-4" /> {t('dashboard.settings.tabs.workspace')}
            </TabsTrigger>
            <TabsTrigger value="security" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
              <Shield className="mr-2 h-4 w-4" /> {t('dashboard.settings.tabs.security')}
            </TabsTrigger>
            <TabsTrigger value="deleted" className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
              <Trash2 className="mr-2 h-4 w-4" /> {t('dashboard.settings.tabs.deleted')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">{t('dashboard.settings.profile.personalInfo')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('dashboard.settings.profile.personalInfoDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <AvatarUpload size="lg" />
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
                      <User className="h-4 w-4 text-muted-foreground" /> {t('dashboard.settings.profile.fullName')}
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('auth.register.namePlaceholder')}
                      className="bg-muted/50 border-border text-foreground"
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label className="text-foreground">{t('dashboard.settings.profile.email')}</Label>
                    <Input value={user?.email} disabled className="bg-muted/50 border-border text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{t('dashboard.settings.profile.emailChange')}</p>
                  </div>

                  {/* Nationality */}
                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" /> {t('dashboard.settings.profile.nationality')} <span className="text-muted-foreground/70 font-normal">{t('dashboard.settings.profile.optional')}</span>
                    </Label>
                    <select
                      id="nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-border bg-muted/50 px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">{t('dashboard.settings.profile.selectPlaceholder')}</option>
                      {NATIONALITIES.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-foreground text-background font-medium hover:bg-foreground/90">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? t('dashboard.settings.profile.saving') : t('dashboard.settings.profile.saveChanges')}
                  </Button>
                </CardContent>
              </Card>

              {/* Username Card */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2"><AtSign className="h-5 w-5" /> {t('dashboard.settings.profile.username.title')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('dashboard.settings.profile.username.titleDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground">{t('dashboard.settings.profile.username.newUsername')}</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('auth.register.usernamePlaceholder')}
                      className="bg-muted/50 border-border text-foreground"
                    />
                    <p className="text-xs text-muted-foreground">{t('dashboard.settings.profile.username.shownPublic')}</p>
                  </div>
                  <Button onClick={handleSaveUsername} disabled={isSavingUsername} className="bg-foreground text-background font-medium hover:bg-foreground/90">
                    {isSavingUsername && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSavingUsername ? t('dashboard.settings.profile.saving') : t('dashboard.settings.profile.changeUsername')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workspace Tab */}
          <TabsContent value="workspace">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">{t('dashboard.settings.workspace.title')}</CardTitle>
                <CardDescription className="text-muted-foreground">{t('dashboard.settings.workspace.titleDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Target Job */}
                <div className="space-y-2">
                  <Label htmlFor="defaultTargetJob" className="text-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" /> {t('dashboard.settings.workspace.targetJob')} <span className="text-muted-foreground/70 font-normal">{t('dashboard.settings.workspace.optional')}</span>
                  </Label>
                  <Input
                    id="defaultTargetJob"
                    value={defaultTargetJob}
                    onChange={(e) => setDefaultTargetJob(e.target.value)}
                    placeholder={t('dashboard.settings.workspace.placeholder.targetJob')}
                    className="bg-muted/50 border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">{t('dashboard.settings.workspace.hintTargetJob')}</p>
                </div>

                {/* Default Target Industry */}
                <div className="space-y-2">
                  <Label htmlFor="defaultTargetIndustry" className="text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" /> {t('dashboard.settings.workspace.industry')} <span className="text-muted-foreground/70 font-normal">{t('dashboard.settings.workspace.optional')}</span>
                  </Label>
                  <select
                    id="defaultTargetIndustry"
                    value={defaultTargetIndustry}
                    onChange={(e) => setDefaultTargetIndustry(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-border bg-muted/50 px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">{t('dashboard.settings.profile.selectPlaceholder')}</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <Button onClick={handleSaveWorkspace} disabled={isSavingWorkspace} className="bg-foreground text-background font-medium hover:bg-foreground/90">
                  {isSavingWorkspace && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSavingWorkspace ? t('dashboard.settings.workspace.saving') : t('dashboard.settings.workspace.saveWorkspace')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Change Password Card */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5" /> {t('dashboard.settings.security.title')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('dashboard.settings.security.titleDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-foreground">{t('dashboard.settings.security.currentPassword')}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={t('dashboard.settings.security.placeholder.current')}
                      className="bg-muted/50 border-border text-foreground"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-foreground">{t('dashboard.settings.security.newPassword')}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('dashboard.settings.security.placeholder.minLength')}
                        className="bg-muted/50 border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">{t('dashboard.settings.security.confirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('dashboard.settings.security.placeholder.repeat')}
                        className="bg-muted/50 border-border text-foreground"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="bg-foreground text-background font-medium hover:bg-foreground/90"
                  >
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isChangingPassword ? t('dashboard.settings.security.changing') : t('dashboard.settings.security.changePassword')}
                  </Button>
                </CardContent>
              </Card>

              {/* Logout Card */}
              <Card className="bg-card border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2"><LogOut className="h-5 w-5" /> {t('dashboard.settings.security.logout.title')}</CardTitle>
                  <CardDescription className="text-muted-foreground">{t('dashboard.settings.security.logout.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={() => { logout(); router.push('/login'); }}>{t('dashboard.settings.security.logout.button')}</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deleted CVs Tab */}
          <TabsContent value="deleted">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Trash2 className="h-5 w-5" /> {t('dashboard.settings.deleted.title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('dashboard.settings.deleted.titleDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDeleted ? (
                  <p className="text-muted-foreground">{t('dashboard.settings.deleted.loading')}</p>
                ) : deletedCVs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{t('dashboard.settings.deleted.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deletedCVs.map((cv) => (
                      <div
                        key={cv.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{cv.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('dashboard.settings.deleted.deletedOn')} {cv.deletedAt ? new Date(cv.deletedAt).toLocaleDateString() : 'fecha unknown'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCV(cv);
                            setShowRestoreDialog(true);
                          }}
                          className="border-border text-foreground hover:bg-secondary"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          {t('dashboard.settings.deleted.restore')}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Restore Confirmation Dialog */}
        <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <RotateCcw className="h-5 w-5" />
                {t('dashboard.settings.deleted.restoreConfirm.title')}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t('dashboard.settings.deleted.restoreConfirm.message')} <strong>"{selectedCV?.title}"</strong>{t('dashboard.settings.deleted.restoreConfirm.messageEnd')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRestoreDialog(false)}
                disabled={restoreMutation.isPending}
              >
                {t('dashboard.settings.deleted.restoreConfirm.cancel')}
              </Button>
              <Button
                onClick={handleRestore}
                disabled={restoreMutation.isPending}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                {restoreMutation.isPending ? t('dashboard.settings.deleted.restoring') : t('dashboard.settings.deleted.restore')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

