'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cancelTransaction } from '@/features/transactions/actions';

export function CancelTransactionButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm('Cancelar este movimiento? Se revertira su efecto en el saldo.')) return;
    startTransition(async () => {
      await cancelTransaction(id);
      router.refresh();
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={pending} className="text-xs text-[var(--ds-color-danger-text)] underline disabled:opacity-50">
      Cancelar
    </button>
  );
}
