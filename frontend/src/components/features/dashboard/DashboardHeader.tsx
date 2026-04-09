'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { FileText, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function DashboardHeader() {
  const { user, logout } = useAuthStore();
  const initials = user?.username?.slice(0, 2).toUpperCase() || user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <FileText className="h-6 w-6" /><span>CVMaster</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/community" className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors">Comunidad</Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar><AvatarFallback className="bg-foreground text-background">{initials}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-border" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">@{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  {user?.isPremium && <Badge variant="secondary" className="w-fit mt-1 bg-secondary text-foreground">Premium</Badge>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Link href="/dashboard/settings" className="text-foreground flex items-center"><User className="mr-2 h-4 w-4" />Configuración</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); window.location.href = '/login'; }} className="text-destructive hover:text-destructive/80"><LogOut className="mr-2 h-4 w-4" />Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
