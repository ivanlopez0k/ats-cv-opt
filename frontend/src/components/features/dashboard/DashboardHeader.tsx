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
  const initials = user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-md glass-header">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <FileText className="h-6 w-6 text-white" /><span className="text-white">CVMaster</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/community" className="inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg hover:bg-white/10 transition-colors">Comunidad</Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar><AvatarFallback className="bg-white text-black">{initials || <User className="h-5 w-5" />}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/80 backdrop-blur-xl border-white/10" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                  {user?.isPremium && <Badge variant="secondary" className="w-fit mt-1 bg-white/20 text-white">Premium</Badge>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem><Link href="/dashboard/settings" className="text-white flex items-center"><User className="mr-2 h-4 w-4" />Configuración</Link></DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => { logout(); window.location.href = '/login'; }} className="text-red-400 hover:text-red-300"><LogOut className="mr-2 h-4 w-4" />Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
