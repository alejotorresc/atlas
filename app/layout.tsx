import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { RouteProgress } from '@/components/layout/route-progress';

export const metadata: Metadata = {
  title: 'ATLAS — Control financiero personal',
  description: 'ATLAS centraliza cuentas, tarjetas, movimientos, ahorros y presupuestos en un solo lugar.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
