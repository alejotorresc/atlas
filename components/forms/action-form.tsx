'use client';

import { ReactNode, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export interface FormActionResult {
  error?: string;
  success?: boolean;
}

export function ActionForm({
  action,
  onSuccess,
  submitLabel = 'Guardar',
  children,
}: {
  action: (formData: FormData) => Promise<FormActionResult>;
  onSuccess?: () => void;
  submitLabel?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <form action={handleAction} className="space-y-4">
      {children}
      {error && (
        <p role="alert" className="text-sm text-[var(--ds-color-danger)]">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}
