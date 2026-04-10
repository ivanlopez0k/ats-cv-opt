'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoginForm } from '@/components/features/auth/LoginForm';
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          <span className="text-sm">Volver</span>
        </Link>
        <ThemeToggle />
      </div>
      <LoginForm />
    </div>
  );
}
