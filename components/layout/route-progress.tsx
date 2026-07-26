'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Slim top-of-viewport loading bar for route transitions (Linear/Vercel/
 * GitHub style). App Router has no global "navigation started" event, so
 * this listens for clicks on same-origin, non-modified anchor clicks to
 * start the bar, fakes incremental progress while the new route streams
 * in, and completes it the moment the pathname/search params actually
 * change (the one reliable "navigation finished" signal available).
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearTimers() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    }

    function handleClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      clearTimers();
      setVisible(true);
      setProgress(15);
      intervalRef.current = setInterval(() => {
        setProgress((p) => (p >= 88 ? p : p + (88 - p) * 0.12));
      }, 120);
    }

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const finishTimeout = setTimeout(() => {
      setProgress(100);
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }, 0);
    return () => {
      clearTimeout(finishTimeout);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] bg-transparent">
      <div
        className="h-full bg-[var(--ds-color-primary)] transition-[width,opacity] duration-[200ms] ease-[var(--ds-ease-decelerate)]"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  );
}
