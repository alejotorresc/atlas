import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ATLAS — Control financiero personal',
  description: 'ATLAS centraliza cuentas, tarjetas, movimientos, ahorros y presupuestos en un solo lugar.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
