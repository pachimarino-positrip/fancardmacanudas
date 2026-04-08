import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Macanudas Fan Card',
  description: 'Loyalty card for Macanudas Empanadas Argentinas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
