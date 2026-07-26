'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Fade + slight slide on every route change (180-220ms) — the page
 * content itself explains the state change, not decoration. No exit
 * animation: the App Router already streams the new route in, so
 * animating only the entrance keeps navigation feeling immediate.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
