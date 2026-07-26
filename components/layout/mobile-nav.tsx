'use client';

import { useState } from 'react';
import { NavLinks } from './nav-links';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium"
      >
        Menu
      </button>
      {open && (
        <div id="mobile-nav-panel" className="mt-2 rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
