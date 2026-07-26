import type { Metadata } from 'next';
import { StyleGuideNav } from './style-guide-nav';

export const metadata: Metadata = {
  title: 'ATLAS — Design System',
  description: 'Internal product design system for ATLAS.',
};

export default function StyleGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1200px] gap-[48px] px-[16px] py-[32px] md:px-[32px] md:py-[64px]">
        <StyleGuideNav />
        <main className="min-w-0 flex-1 pb-[64px]">{children}</main>
      </div>
    </div>
  );
}
