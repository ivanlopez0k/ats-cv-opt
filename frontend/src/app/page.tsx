'use client';

import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FadeIn } from '@/components/landing/FadeIn';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <FadeIn>
          <HeroSection />
        </FadeIn>
        <FadeIn>
          <StatsBar />
        </FadeIn>
        <FadeIn>
          <BeforeAfterSection />
        </FadeIn>
        <FadeIn>
          <HowItWorksSection />
        </FadeIn>
        <FadeIn>
          <FeaturesSection />
        </FadeIn>
        <FadeIn>
          <FAQSection />
        </FadeIn>
        <FadeIn>
          <CTASection />
        </FadeIn>
      </main>
      <LandingFooter />
    </div>
  );
}
