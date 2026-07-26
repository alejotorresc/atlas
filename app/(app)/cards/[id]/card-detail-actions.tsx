'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { ActionForm, type FormActionResult } from '@/components/forms/action-form';
import { archiveCard, payCard, updateCard } from '@/features/cards/actions';
import { todayISO } from '@/lib/dates/format';
import type { Account, CreditCard } from '@/types/database';

export function CardDetailActions({ card, accounts }: { card: CreditCard; accounts: Account[] }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [confirmExceeds, setConfirmExceeds] = useState(false);

  async function handleArchive() {
    if (!confirm('Archivar esta tarjeta?')) return;
    const result = await archiveCard(card.id);
    if (!result.error) router.push('/cards');
  }

  async function handlePay(formData: FormData): Promise<FormActionResult> {
    if (confirmExceeds) formData.set('confirm_exceeds_balance', 'on');
    const result = await payCard(card.id, formData);
    if (result.error === 'CONFIRM_EXCEEDS_ACCOUNT_BALANCE') {
      return { error: 'El monto excede el saldo de la cuenta origen. Marca la casilla para confirmar y reintenta.' };
    }
    if (result.error === 'CONFIRM_EXCEEDS_CARD_BALANCE') {
      return { error: 'El monto excede el saldo actual de la tarjeta. Marca la casilla para confirmar y reintenta.' };
    }
    return result;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => setPayOpen(true)}>Registrar pago</Button>
      <Button variant="secondary" onClick={() => setEditOpen(true)}>
        Editar
      </Button>
      <Button variant="danger" onClick={handleArchive}>
        Archivar
      </Button>

      <Dialog open={payOpen} onClose={() => setPayOpen(false)} title="Registrar pago de tarjeta">
        <ActionForm action={handlePay} onSuccess={() => setPayOpen(false)} submitLabel="Pagar">
          <div>
            <Label htmlFor="source_account_id">Cuenta origen</Label>
            <Select
              id="source_account_id"
              name="source_account_id"
              required
              placeholder="Selecciona una cuenta"
              options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            />
          </div>
          <div>
            <Label htmlFor="pay-amount">Monto</Label>
            <Input id="pay-amount" name="amount" required />
          </div>
          <div>
            <Label htmlFor="pay-date">Fecha</Label>
            <DatePicker id="pay-date" name="transaction_date" defaultValue={todayISO()} required />
          </div>
          <div>
            <Label htmlFor="pay-desc">Descripcion</Label>
            <Input id="pay-desc" name="description" defaultValue="Pago de tarjeta" required />
          </div>
          <div className="flex items-center gap-[8px]">
            <Checkbox id="confirm-exceeds" checked={confirmExceeds} onCheckedChange={(v) => setConfirmExceeds(v === true)} />
            <Label htmlFor="confirm-exceeds" className="mb-0">
              Confirmo el monto aunque exceda el saldo disponible o de la tarjeta
            </Label>
          </div>
        </ActionForm>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar tarjeta">
        <ActionForm action={(fd) => updateCard(card.id, fd)} onSuccess={() => setEditOpen(false)}>
          <div>
            <Label htmlFor="edit-card-name">Nombre</Label>
            <Input id="edit-card-name" name="name" defaultValue={card.name} required />
          </div>
          <div>
            <Label htmlFor="edit-card-institution">Institucion</Label>
            <Input id="edit-card-institution" name="institution_name" defaultValue={card.institution_name ?? ''} />
          </div>
          <div>
            <Label htmlFor="edit-card-last4">Ultimos 4 digitos</Label>
            <Input id="edit-card-last4" name="last_four" defaultValue={card.last_four ?? ''} maxLength={4} />
          </div>
          <div>
            <Label htmlFor="edit-card-limit">Limite de credito</Label>
            <Input id="edit-card-limit" name="credit_limit" defaultValue={(card.credit_limit_minor / 100).toFixed(2)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-card-statement">Dia de corte</Label>
              <Input id="edit-card-statement" name="statement_day" type="number" min={1} max={31} defaultValue={card.statement_day} required />
            </div>
            <div>
              <Label htmlFor="edit-card-due">Dia de pago</Label>
              <Input id="edit-card-due" name="payment_due_day" type="number" min={1} max={31} defaultValue={card.payment_due_day} required />
            </div>
          </div>
        </ActionForm>
      </Dialog>
    </div>
  );
}
