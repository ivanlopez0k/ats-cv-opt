'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/features/auth/LoginForm';
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Link href="/" className="absolute top-4 left-4 inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-1 h-4 w-4" />
        <span className="text-sm">Volver</span>
      </Link>
      <LoginForm />
    </div>
  );
}
