import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHAROFOV SCHOOL — Zamonaviy Ta’lim Markazi & Rasmiy Aksiya',
  description:
    'SHAROFOV SCHOOL o‘quv markazi — Ingliz tili, Rus tili, Arab tili, Pochemuchka va Matematika kurslari. Bilimga ishonch bilan qadam!',
  icons: {
    icon: '/school-logo.svg',
  },
  openGraph: {
    title: 'SHAROFOV SCHOOL — Zamonaviy Ta’lim Markazi',
    description: 'Sifatli ta’lim, zamonaviy o‘quv qo‘llanmalar va maxsus 50 000 so‘m pul mukofoti aksiyasi.',
    url: 'https://sharofov-school.vercel.app',
    siteName: 'SHAROFOV SCHOOL',
    locale: 'uz_UZ',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#4b1684',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <link rel="icon" href="/school-logo.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
