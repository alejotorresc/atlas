'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { dismissAlert, manualRefreshAlerts, markAlertRead, markAllAlertsRead } from '@/features/alerts/actions';

export function RefreshAlertsButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await manualRefreshAlerts();
          router.refresh();
        })
      }
    >
      {pending ? 'Actualizando...' : 'Actualizar alertas'}
    </Button>
  );
}

export function MarkAllReadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await markAllAlertsRead();
          router.refresh();
        })
      }
    >
      Marcar todas como leidas
    </Button>
  );
}

export function AlertRowActions({ alertId, isRead }: { alertId: string; isRead: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {!isRead && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await markAlertRead(alertId);
              router.refresh();
            })
          }
          className="text-xs text-[var(--ds-neutral-600)] underline"
        >
          Marcar leida
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await dismissAlert(alertId);
            router.refresh();
          })
        }
        className="text-xs text-[var(--ds-color-danger-text)] underline"
      >
        Descartar
      </button>
    </div>
  );
}
