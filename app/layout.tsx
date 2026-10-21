import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Sharofov School — QR Referal', description: 'Sharofov School QR referal va mukofot tizimi' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="uz"><body>{children}</body></html>; }
