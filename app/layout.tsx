// app/layout.tsx

import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'JobMe',                        
  description: 'Find Your Dream Job',
  icons: {
    icon: '/favicon.ico',        
    apple: '/icon.png',
  },
  openGraph: {
    title: 'JobMe',
    description: 'Find Your Dream Job',
    images: [{ url: '/jobme_og_image.svg', width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
           <SplashScreen /> 
           <ChatBot />  
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}