'use client';

import { ReactNode, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export interface FormActionResult {
  error?: string;
  success?: boolean;
}

export function ActionForm<TResult extends FormActionResult = FormActionResult>({
  action,
  onSuccess,
  submitLabel = 'Guardar',
  children,
}: {
  action: (formData: FormData) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
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
      onSuccess?.(result);
    });
  }

  return (
    <form action={handleAction} className="space-y-4">
      {children}
      {error && (
        <p role="alert" className="text-sm text-[var(--ds-color-danger-text)]">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}
