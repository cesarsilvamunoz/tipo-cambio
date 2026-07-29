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
    'Plataforma oficial de conversión de divisas en Costa Rica, Brasil y el mundo. Cotizaciones en tiempo real para CRC, BRL, USD, EUR y más monedas con asistencia de IA.',
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}