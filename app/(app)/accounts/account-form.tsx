'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createAccount } from '@/features/accounts/actions';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Monetaria' },
  { value: 'savings', label: 'Ahorro' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'digital_wallet', label: 'Billetera digital' },
  { value: 'investment', label: 'Inversion' },
  { value: 'other', label: 'Otro' },
] as const;

export function NewAccountButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva cuenta</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Nueva cuenta">
        <ActionForm action={createAccount} onSuccess={() => setOpen(false)} submitLabel="Crear cuenta">
          <div>
            <Label htmlFor="acc-name">Nombre</Label>
            <Input id="acc-name" name="name" required />
          </div>
          <div>
            <Label htmlFor="acc-institution">Institucion</Label>
            <Input id="acc-institution" name="institution_name" />
          </div>
          <div>
            <Label htmlFor="acc-type">Tipo</Label>
            <Select id="acc-type" name="account_type" options={[...ACCOUNT_TYPES]} defaultValue="checking" />
          </div>
          <div>
            <Label htmlFor="acc-opening">Saldo inicial</Label>
            <Input id="acc-opening" name="opening_balance" defaultValue="0.00" required />
          </div>
          <div className="flex items-center gap-[8px]">
            <Checkbox id="acc-include" name="include_in_available_balance" defaultChecked />
            <Label htmlFor="acc-include" className="mb-0">
              Incluir en saldo disponible
            </Label>
          </div>
        </ActionForm>
      </Dialog>
    </>
  );
}
