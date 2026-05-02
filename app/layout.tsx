// app/layout.tsx

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import './globals.css';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { ChatBot } from '@/components/layout/ChatBot';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfd' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: '%s | JobMe Terminal',
    default: 'JobMe | Unified Employment Registry',
  },
  description: 'Industrial-grade job matching and talent procurement system.',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'JobMe System',
    description: 'Find Your Dream Job via our Unified Registry',
    images: [{ url: '/jobme_og_image.svg', width: 1200, height: 630 }],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="selection:bg-blue-600/10 selection:text-blue-600">
      <body 
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          bg-[#fcfcfd] 
          dark:bg-zinc-950 
          text-slate-900 
          dark:text-zinc-100
          min-h-screen
          scrollbar-thin
          scrollbar-thumb-slate-200
          dark:scrollbar-thumb-zinc-800
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* System Overlays */}
          <SplashScreen /> 
          <ChatBot /> 
          
          {/* Main Viewport Container */}
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>

          {/* Global Registry Borders (Subtle aesthetic frame) */}
          <div className="fixed inset-0 pointer-events-none border-[10px] border-transparent border-t-blue-600/5 dark:border-t-blue-500/5 z-[9999]" />
        </ThemeProvider>
      </body>
    </html>
  );
}