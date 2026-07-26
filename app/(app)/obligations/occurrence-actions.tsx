'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { markOccurrencePaid, skipOccurrence } from '@/features/obligations/actions';
import { formatMinorUnits } from '@/lib/finance/money';
import { todayISO } from '@/lib/dates/format';
import type { Account, CreditCard, ObligationOccurrence } from '@/types/database';

export function OccurrenceActions({
  occurrence,
  accounts,
  cards,
}: {
  occurrence: ObligationOccurrence;
  accounts: Account[];
  cards: CreditCard[];
}) {
  const router = useRouter();
  const [payOpen, setPayOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSkip() {
    startTransition(async () => {
      await skipOccurrence(occurrence.id);
      router.refresh();
    });
  }

  if (occurrence.status === 'paid' || occurrence.status === 'skipped') {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => setPayOpen(true)}>
        Marcar pagado
      </Button>
      <Button variant="ghost" onClick={handleSkip} disabled={pending}>
        Omitir
      </Button>

      <Dialog open={payOpen} onClose={() => setPayOpen(false)} title="Registrar pago de obligacion">
        <ActionForm action={(fd) => markOccurrencePaid(occurrence.id, fd)} onSuccess={() => setPayOpen(false)} submitLabel="Confirmar pago">
          <div>
            <Label htmlFor="occ-amount">Monto pagado</Label>
            <Input id="occ-amount" name="actual_amount" defaultValue={formatMinorUnits(occurrence.expected_amount_minor)} required />
          </div>
          <div>
            <Label htmlFor="occ-date">Fecha de pago</Label>
            <Input id="occ-date" name="transaction_date" type="date" defaultValue={todayISO()} required />
          </div>
          <div>
            <Label htmlFor="occ-account">Cuenta de pago</Label>
            <Select id="occ-account" name="account_id">
              <option value="">Ninguna</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="occ-card">O tarjeta de pago</Label>
            <Select id="occ-card" name="credit_card_id">
              <option value="">Ninguna</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </ActionForm>
      </Dialog>
    </div>
  );
}
