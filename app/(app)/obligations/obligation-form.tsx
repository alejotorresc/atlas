'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createObligation } from '@/features/obligations/actions';
import { todayISO } from '@/lib/dates/format';
import type { Account, Category, CreditCard } from '@/types/database';

const OBLIGATION_TYPES = [
  ['bill', 'Servicio'],
  ['subscription', 'Suscripcion'],
  ['rent', 'Renta'],
  ['loan', 'Prestamo'],
  ['insurance', 'Seguro'],
  ['card_payment', 'Pago de tarjeta'],
  ['savings', 'Ahorro'],
  ['other', 'Otro'],
] as const;

const FREQUENCIES = [
  ['weekly', 'Semanal'],
  ['biweekly', 'Quincenal'],
  ['monthly', 'Mensual'],
  ['quarterly', 'Trimestral'],
  ['yearly', 'Anual'],
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
            <Select id="obl-type" name="obligation_type" defaultValue="bill">
              {OBLIGATION_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="obl-amount">Monto</Label>
            <Input id="obl-amount" name="amount" required />
          </div>
          <div>
            <Label htmlFor="obl-amount-type">Tipo de monto</Label>
            <Select id="obl-amount-type" name="amount_type" defaultValue="fixed">
              <option value="fixed">Fijo</option>
              <option value="estimated">Estimado</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="obl-frequency">Frecuencia</Label>
            <Select id="obl-frequency" name="frequency" defaultValue="monthly">
              {FREQUENCIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="obl-next-due">Proxima fecha de vencimiento</Label>
            <Input id="obl-next-due" name="next_due_date" type="date" defaultValue={todayISO()} required />
          </div>
          <div>
            <Label htmlFor="obl-end-date">Fecha de fin (opcional)</Label>
            <Input id="obl-end-date" name="end_date" type="date" />
          </div>
          <div>
            <Label htmlFor="obl-account">Cuenta de pago (opcional)</Label>
            <Select id="obl-account" name="account_id">
              <option value="">Ninguna</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="obl-card">Tarjeta de pago (opcional)</Label>
            <Select id="obl-card" name="credit_card_id">
              <option value="">Ninguna</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="obl-category">Categoria (opcional)</Label>
            <Select id="obl-category" name="category_id">
              <option value="">Ninguna</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
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
