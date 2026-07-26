'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { createSavingsGoal } from '@/features/savings/actions';
import type { Account } from '@/types/database';

export function NewSavingsGoalButton({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nueva meta</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Nueva meta de ahorro">
        <ActionForm action={createSavingsGoal} onSuccess={() => setOpen(false)} submitLabel="Crear meta">
          <div>
            <Label htmlFor="goal-name">Nombre</Label>
            <Input id="goal-name" name="name" required />
          </div>
          <div>
            <Label htmlFor="goal-target">Monto objetivo</Label>
            <Input id="goal-target" name="target_amount" required />
          </div>
          <div>
            <Label htmlFor="goal-date">Fecha objetivo (opcional)</Label>
            <DatePicker id="goal-date" name="target_date" placeholder="Sin fecha objetivo" />
          </div>
          <div>
            <Label htmlFor="goal-account">Cuenta vinculada (opcional)</Label>
            <Select
              id="goal-account"
              name="linked_account_id"
              placeholder="Ninguna"
              options={[{ value: '', label: 'Ninguna' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
            />
          </div>
          <div>
            <Label htmlFor="goal-priority">Prioridad</Label>
            <Select
              id="goal-priority"
              name="priority"
              defaultValue="medium"
              options={[
                { value: 'low', label: 'Baja' },
                { value: 'medium', label: 'Media' },
                { value: 'high', label: 'Alta' },
              ]}
            />
          </div>
          <div className="flex items-center gap-[8px]">
            <Checkbox id="goal-exclude" name="exclude_from_available_balance" defaultChecked />
            <Label htmlFor="goal-exclude" className="mb-0">
              Excluir del saldo disponible
            </Label>
          </div>
        </ActionForm>
      </Dialog>
    </>
  );
}
