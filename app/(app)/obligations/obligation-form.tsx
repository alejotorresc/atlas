'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { createObligation } from '@/features/obligations/actions';
import { todayISO } from '@/lib/dates/format';
import type { Account, Category, CreditCard } from '@/types/database';

const OBLIGATION_TYPES = [
  { value: 'bill', label: 'Servicio' },
  { value: 'subscription', label: 'Suscripcion' },
  { value: 'rent', label: 'Renta' },
  { value: 'loan', label: 'Prestamo' },
  { value: 'insurance', label: 'Seguro' },
  { value: 'card_payment', label: 'Pago de tarjeta' },
  { value: 'savings', label: 'Ahorro' },
  { value: 'other', label: 'Otro' },
] as const;

const AMOUNT_TYPES = [
  { value: 'fixed', label: 'Fijo' },
  { value: 'estimated', label: 'Estimado' },
] as const;

const FREQUENCIES = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
] as const;

export function NewObligationButton({
  accounts,
  cards,
  categories,
}: {
  accounts: Account[];
  cards: CreditCard[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva obligacion</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Nueva obligacion recurrente">
        <ActionForm action={createObligation} onSuccess={() => setOpen(false)} submitLabel="Crear">
          <div>
            <Label htmlFor="obl-name">Nombre</Label>
            <Input id="obl-name" name="name" required />
          </div>
          <div>
            <Label htmlFor="obl-type">Tipo</Label>
            <Select id="obl-type" name="obligation_type" defaultValue="bill" options={[...OBLIGATION_TYPES]} />
          </div>
          <div>
            <Label htmlFor="obl-amount">Monto</Label>
            <Input id="obl-amount" name="amount" required />
          </div>
          <div>
            <Label htmlFor="obl-amount-type">Tipo de monto</Label>
            <Select id="obl-amount-type" name="amount_type" defaultValue="fixed" options={[...AMOUNT_TYPES]} />
          </div>
          <div>
            <Label htmlFor="obl-frequency">Frecuencia</Label>
            <Select id="obl-frequency" name="frequency" defaultValue="monthly" options={[...FREQUENCIES]} />
          </div>
          <div>
            <Label htmlFor="obl-next-due">Proxima fecha de vencimiento</Label>
            <DatePicker id="obl-next-due" name="next_due_date" defaultValue={todayISO()} required />
          </div>
          <div>
            <Label htmlFor="obl-end-date">Fecha de fin (opcional)</Label>
            <DatePicker id="obl-end-date" name="end_date" placeholder="Sin fecha de fin" />
          </div>
          <div>
            <Label htmlFor="obl-account">Cuenta de pago (opcional)</Label>
            <Select
              id="obl-account"
              name="account_id"
              placeholder="Ninguna"
              options={[{ value: '', label: 'Ninguna' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
            />
          </div>
          <div>
            <Label htmlFor="obl-card">Tarjeta de pago (opcional)</Label>
            <Select
              id="obl-card"
              name="credit_card_id"
              placeholder="Ninguna"
              options={[{ value: '', label: 'Ninguna' }, ...cards.map((c) => ({ value: c.id, label: c.name }))]}
            />
          </div>
          <div>
            <Label htmlFor="obl-category">Categoria (opcional)</Label>
            <Select
              id="obl-category"
              name="category_id"
              placeholder="Ninguna"
              options={[{ value: '', label: 'Ninguna' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            />
          </div>
          <div>
            <Label htmlFor="obl-reminder">Dias de recordatorio antes</Label>
            <Input id="obl-reminder" name="reminder_days_before" type="number" min={0} max={30} defaultValue={3} />
          </div>
        </ActionForm>
      </Dialog>
    </>
  );
}
