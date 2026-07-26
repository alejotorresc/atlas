'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { copyPreviousMonthBudgets, upsertBudget } from '@/features/budgets/actions';
import type { Category } from '@/types/database';

export function BudgetActions({ month, categories }: { month: string; categories: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleCopy() {
    startTransition(async () => {
      await copyPreviousMonthBudgets(month);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => setOpen(true)}>Nuevo / editar presupuesto</Button>
      <Button variant="secondary" onClick={handleCopy} disabled={pending}>
        Copiar mes anterior
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Asignar presupuesto">
        <ActionForm action={upsertBudget} onSuccess={() => setOpen(false)} submitLabel="Guardar">
          <input type="hidden" name="month" value={month} />
          <div>
            <Label htmlFor="budget-category">Categoria</Label>
            <Select id="budget-category" name="category_id" required>
              <option value="">Selecciona una categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="budget-amount">Monto asignado</Label>
            <Input id="budget-amount" name="budget_amount" required />
          </div>
          <div className="flex items-center gap-2">
            <input id="budget-rollover" name="rollover_enabled" type="checkbox" />
            <Label htmlFor="budget-rollover" className="mb-0">
              Permitir arrastre al siguiente mes
            </Label>
          </div>
        </ActionForm>
      </Dialog>
    </div>
  );
}
