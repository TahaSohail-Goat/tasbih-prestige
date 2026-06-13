import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tasbih Digital Prestige — Islamic Remembrance Companion',
  description: 'A premium spiritual tally counter for Islamic Dhikr and Duas. Features AI-powered supplication generation, bead mode, ambient sounds, and streak tracking.',
  keywords: ['tasbih', 'dhikr', 'islamic', 'prayer', 'counter', 'muslim', 'zikr', 'dua'],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tasbih',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#021a16',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.png" />
      </head>
      <body suppressHydrationWarning className="overscroll-none">
        {children}
      </body>
    </html>
  );
}
