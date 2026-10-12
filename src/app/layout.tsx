import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'After the Card | Sickle Cell Post-Screening Care Loop',
  description: 'National Sickle Cell Mission post-screening care loop connecting tribal families and frontline ASHA workers in Madhya Pradesh.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-canvas-50 text-ink-900 antialiased selection:bg-blood-100 selection:text-blood-900">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
