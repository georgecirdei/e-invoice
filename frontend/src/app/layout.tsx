import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DensityProvider } from '@/contexts/DensityContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Invoice - Electronic Invoicing System',
  description: 'Modern e-invoicing system for compliant electronic invoicing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DensityProvider>
          {children}
        </DensityProvider>
      </body>
    </html>
  );
}

