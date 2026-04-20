import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { BeforeAfterSection } from '@/components/landing/BeforeAfterSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

/**
 * Landing Page - Server Component
 * Renders static HTML on server for optimal LCP
 * Animation libraries (Framer Motion) load client-side only
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        {/* Static render on server - no animation wrapper */}
        <HeroSection />
        <StatsBar />
        <BeforeAfterSection />
        <HowItWorksSection />
        <FeaturesSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}

/**
 * Generate metadata for SEO
 */
export const metadata = {
  title: 'CVMaster - Optimizá tu CV con IA',
  description: 'Subí tu CV y mejoralo con inteligencia artificial para pasar los filtros ATS y aumentar tus posibilidades de conseguir el empleo ideal.',
  keywords: ['CV', 'curriculum', 'ATS', 'inteligencia artificial', 'empleo'],
};
