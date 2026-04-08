import './globals.css';
import type { Metadata } from 'next';
import { Aleo } from 'next/font/google';

const aleo = Aleo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Macanudas Fan Card',
  description: 'Loyalty card for Macanudas Empanadas Argentinas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={aleo.className}>{children}</body>
    </html>
  );
}