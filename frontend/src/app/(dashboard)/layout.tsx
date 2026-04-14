'use client';

import { AuthGuard } from '@/lib/guards';
import { useAuthStore } from '@/lib/stores/authStore';
import { EmailVerificationBanner } from '@/components/features/auth/EmailVerificationBanner';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isEmailVerified } = useAuthStore();

  return (
    <>
      {user && !isEmailVerified && (
        <EmailVerificationBanner
          userEmail={user.email}
          onVerified={() => {}}
        />
      )}
      <AuthGuard>{children}</AuthGuard>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
