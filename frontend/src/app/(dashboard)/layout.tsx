'use client';

import { AuthGuard } from '@/lib/guards';
import { useAuthStore } from '@/lib/stores/authStore';
import { EmailVerificationBanner } from '@/components/features/auth/EmailVerificationBanner';
import { SkipLink } from '@/components/SkipLink';
import { OnboardingModal } from '@/components/OnboardingModal';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isEmailVerified } = useAuthStore();

  return (
    <>
      <SkipLink />
      {user && !isEmailVerified && (
        <EmailVerificationBanner
          userEmail={user.email}
          onVerified={() => {}}
        />
      )}
      <OnboardingModal />
      <AuthGuard>
        <main id="main-content">{children}</main>
      </AuthGuard>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
