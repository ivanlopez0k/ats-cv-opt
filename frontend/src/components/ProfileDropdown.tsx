'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function ProfileDropdown() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const initials = user?.username?.slice(0, 2).toUpperCase() || user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-10 w-10 rounded-full hover:bg-secondary transition-colors">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatarUrl || undefined} />
          <AvatarFallback className="bg-foreground text-background text-sm font-semibold">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card border-border" align="end">
        <div className="px-4 py-3">
          <p className="text-sm font-medium text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">@{user?.username}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          {user?.isPremium && <Badge variant="secondary" className="w-fit mt-1 bg-secondary text-foreground">Premium</Badge>}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/dashboard')} className="flex items-center">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          Configuración
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { logout(); router.push('/login'); }} className="text-destructive hover:text-destructive/80">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
