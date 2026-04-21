import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'CVMaster - Optimiza tu CV para pasar los filtros ATS',
    template: '%s | CVMaster',
  },
  description: 'Sube tu CV y deja que la IA lo optimice para superar los sistemas de seguimiento de candidatos (ATS). Mejora tu CV con inteligencia artificial.',
  keywords: ['CV', 'resume', 'ATS', 'optimización', 'inteligencia artificial', 'empleo', 'trabajo'],
  authors: [{ name: 'CVMaster' }],
  creator: 'CVMaster',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://cvmaster.com',
    siteName: 'CVMaster',
    title: 'CVMaster - Optimiza tu CV para pasar los filtros ATS',
    description: 'Sube tu CV y deja que la IA lo optimice para superar los sistemas ATS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CVMaster - Optimiza tu CV con IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CVMaster - Optimiza tu CV para pasar los filtros ATS',
    description: 'Sube tu CV y deja que la IA lo optimice para superar los sistemas ATS',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
