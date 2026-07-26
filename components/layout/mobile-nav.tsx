'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { NavLinks } from './nav-links';
import { Icon } from '@/components/design-system/Icon';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-[44px] w-[44px] items-center justify-center rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-300)] text-[var(--ds-neutral-700)]"
      >
        <Icon icon={Menu} />
      </button>
      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute right-[16px] mt-[8px] rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)] p-[8px] shadow-[var(--ds-shadow-md)]"
        >
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
