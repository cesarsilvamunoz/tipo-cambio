import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DIVISAEXPERT • Conversor de Monedas y Tipo de Cambio',
  description:
    'Plataforma oficial de conversión de divisas en Costa Rica, Brasil y el mundo. Cotizaciones en tiempo real para CRC, BRL, USD, EUR y más monedas.',
  applicationName: 'DIVISAEXPERT',
  keywords: [
    'tipo de cambio',
    'conversor de monedas',
    'CRC',
    'BRL',
    'USD',
    'EUR',
    'Costa Rica',
    'Brasil',
    'BCCR',
    'SUGEF',
  ],
  authors: [{ name: 'BancaDivisa Digital Solutions S.A.' }],
  creator: 'BancaDivisa Digital Solutions S.A.',
  publisher: 'DIVISAEXPERT',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'DIVISAEXPERT',
    statusBarStyle: 'black-translucent',
    startupImage: ['/icon-512.png'],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icon-167.png', sizes: '167x167', type: 'image/png' },
    ],
    shortcut: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'DIVISAEXPERT • Conversor de Monedas y Tipo de Cambio',
    description: 'Conversor de monedas en tiempo real para CRC, BRL, USD, EUR y más.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DIVISAEXPERT • Conversor de Monedas',
    description: 'Conversor de monedas en tiempo real para CRC, BRL, USD, EUR y más.',
    images: ['/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DIVISAEXPERT" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); }); }`,
          }}
        />
      </body>
    </html>
  );
}