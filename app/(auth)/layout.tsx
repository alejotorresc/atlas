export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ds-color-background)] px-[16px]">
      <div className="w-full max-w-sm">
        <div className="mb-[24px] text-center">
          <span className="text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">ATLAS</span>
          <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-500)]">Control financiero personal</p>
        </div>
        <div className="rounded-[var(--ds-radius-xl)] border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)] p-[24px] shadow-[var(--ds-shadow-sm)]">
          {children}
        </div>
      </div>
    </div>
  );
}
