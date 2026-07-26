'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createCard } from '@/features/cards/actions';

export function NewCardButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva tarjeta</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Nueva tarjeta">
        <ActionForm action={createCard} onSuccess={() => setOpen(false)} submitLabel="Crear tarjeta">
          <div>
            <Label htmlFor="card-name">Nombre</Label>
            <Input id="card-name" name="name" required />
          </div>
          <div>
            <Label htmlFor="card-institution">Institucion</Label>
            <Input id="card-institution" name="institution_name" />
          </div>
          <div>
            <Label htmlFor="card-last4">Ultimos 4 digitos</Label>
            <Input id="card-last4" name="last_four" maxLength={4} />
          </div>
          <div>
            <Label htmlFor="card-limit">Limite de credito</Label>
            <Input id="card-limit" name="credit_limit" defaultValue="0.00" required />
          </div>
          <div>
            <Label htmlFor="card-balance">Saldo actual</Label>
            <Input id="card-balance" name="current_balance" defaultValue="0.00" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card-statement">Dia de corte</Label>
              <Input id="card-statement" name="statement_day" type="number" min={1} max={31} defaultValue={1} required />
            </div>
            <div>
              <Label htmlFor="card-due">Dia de pago</Label>
              <Input id="card-due" name="payment_due_day" type="number" min={1} max={31} defaultValue={15} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card-apr">Tasa de interes anual (APR %)</Label>
              <Input id="card-apr" name="annual_interest_rate" placeholder="24.99" />
            </div>
            <div>
              <Label htmlFor="card-method">Metodo de calculo de interes</Label>
              <Select
                id="card-method"
                name="interest_calculation_method"
                defaultValue="statement_balance"
                options={[
                  { value: 'statement_balance', label: 'Saldo de estado de cuenta' },
                  { value: 'average_daily_balance', label: 'Promedio diario (aproximado)' },
                ]}
              />
            </div>
          </div>
        </ActionForm>
      </Dialog>
    </>
  );
}
