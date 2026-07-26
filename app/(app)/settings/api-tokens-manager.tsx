'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CopyButton } from '@/components/design-system/CopyButton';
import { createApiToken, revokeApiToken, type CreateApiTokenResult } from '@/features/api-tokens/actions';
import { formatDateGT } from '@/lib/dates/format';
import type { ApiToken } from '@/types/database';

export function ApiTokensManager({ tokens }: { tokens: ApiToken[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRevoke(token: ApiToken) {
    if (!confirm(`Revocar el acceso de "${token.name}"? Cualquier Shortcut que lo use dejara de funcionar.`)) return;
    startTransition(async () => {
      await revokeApiToken(token.id);
      router.refresh();
    });
  }

  function handleCreated(result: CreateApiTokenResult) {
    setCreateOpen(false);
    if (result.token) setNewToken(result.token);
  }

  return (
    <div className="space-y-[16px]">
      <Card>
        <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">Acceso para Shortcuts (iPhone)</p>
        <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-600)]">
          Genera un token personal para registrar gastos desde un Shortcut de iOS sin abrir la app. El token actua como tu
          identidad para esa integracion — tratalo como una contrasena.
        </p>
        <div className="mt-[16px]">
          <Button onClick={() => setCreateOpen(true)}>Generar token</Button>
        </div>
      </Card>

      {tokens.length > 0 && (
        <ul className="divide-y divide-[var(--ds-neutral-100)] rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)]">
          {tokens.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-[12px] px-[16px] py-[12px] text-[13px]">
              <div>
                <p className="font-medium text-[var(--ds-neutral-900)]">{t.name}</p>
                <p className="text-[var(--ds-neutral-500)]">
                  Creado {formatDateGT(t.created_at.slice(0, 10))}
                  {t.last_used_at ? ` · Usado por ultima vez ${formatDateGT(t.last_used_at.slice(0, 10))}` : ' · Sin uso todavia'}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 text-[13px] text-[var(--ds-color-danger-text)] underline"
                disabled={pending}
                onClick={() => handleRevoke(t)}
              >
                Revocar
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Generar token">
        <ActionForm action={createApiToken} onSuccess={handleCreated} submitLabel="Generar">
          <div>
            <Label htmlFor="token-name">Nombre</Label>
            <Input id="token-name" name="name" defaultValue="iPhone Shortcuts" required />
          </div>
        </ActionForm>
      </Dialog>

      <Dialog open={!!newToken} onClose={() => setNewToken(null)} title="Token generado">
        {newToken && (
          <div className="space-y-[16px]">
            <p className="text-[13px] text-[var(--ds-color-danger-text)]">
              Copia este token ahora — no se volvera a mostrar. Si lo pierdes, genera uno nuevo.
            </p>
            <div className="flex items-center gap-[8px] rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-300)] bg-[var(--ds-neutral-50)] px-[12px] py-[10px]">
              <code className="flex-1 break-all text-[13px] text-[var(--ds-neutral-900)]">{newToken}</code>
              <CopyButton value={newToken} label="Copiar" />
            </div>
            <div className="rounded-[var(--ds-radius-md)] bg-[var(--ds-neutral-50)] p-[12px] text-[13px] text-[var(--ds-neutral-700)]">
              <p className="font-medium">Configuracion en Shortcuts:</p>
              <ol className="mt-[8px] list-decimal space-y-[4px] pl-[16px]">
                <li>Agrega la accion &quot;Obtener contenido de URL&quot;.</li>
                <li>
                  URL: <code className="text-[12px]">{typeof window !== 'undefined' ? window.location.origin : ''}/api/shortcuts/expense</code>
                </li>
                <li>Metodo: POST. Encabezados: Authorization = Bearer {'<tu token>'}, Content-Type = application/json.</li>
                <li>
                  Cuerpo JSON: <code className="text-[12px]">{'{ "amount": "150.00", "description": "Almuerzo" }'}</code>
                </li>
              </ol>
            </div>
            <Button onClick={() => setNewToken(null)}>Listo</Button>
          </div>
        )}
      </Dialog>
    </div>
  );
}
