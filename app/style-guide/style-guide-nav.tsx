'use client';

import { cn } from '@/lib/utils';

const SECTIONS = [
  ['introduction', 'Introduccion'],
  ['principles', 'Principios'],
  ['typography', 'Tipografia'],
  ['colors', 'Color'],
  ['icons', 'Iconos'],
  ['spacing', 'Espaciado'],
  ['layout', 'Layout & Grid'],
  ['surfaces', 'Superficies'],
  ['buttons', 'Botones'],
  ['forms', 'Formularios'],
  ['cards', 'Tarjetas'],
  ['charts', 'Visualizacion de datos'],
  ['motion', 'Movimiento'],
  ['accessibility', 'Accesibilidad'],
  ['mobile', 'Mobile first'],
  ['writing', 'Lenguaje y voz'],
  ['playground', 'Playground'],
] as const;

export function StyleGuideNav() {
  return (
    <nav
      aria-label="Secciones del sistema de diseno"
      className="sticky top-[32px] hidden h-[calc(100vh-64px)] w-[200px] shrink-0 overflow-y-auto md:block"
    >
      <p className="mb-[16px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">ATLAS DESIGN SYSTEM</p>
      <ul className="space-y-[4px]">
        {SECTIONS.map(([id, label]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={cn(
                'block rounded-[var(--ds-radius-sm)] px-[12px] py-[8px] text-[13px] text-[var(--ds-neutral-600)]',
                'hover:bg-[var(--ds-neutral-100)] hover:text-[var(--ds-neutral-900)]',
                'transition-colors duration-[var(--ds-duration-fast)]',
              )}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
