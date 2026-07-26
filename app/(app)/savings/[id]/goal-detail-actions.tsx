'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { createSavingsContribution, createSavingsWithdrawal } from '@/features/transactions/actions';
import { setSavingsGoalStatus, updateSavingsGoal } from '@/features/savings/actions';
import { todayISO } from '@/lib/dates/format';
import type { Account, SavingsGoal } from '@/types/database';

export function GoalDetailActions({ goal, accounts }: { goal: SavingsGoal; accounts: Account[] }) {
  const router = useRouter();
  const [contributeOpen, setContributeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function contributeWithGoal(fd: FormData) {
    fd.set('savings_goal_id', goal.id);
    return createSavingsContribution(fd);
  }
  function withdrawWithGoal(fd: FormData) {
    fd.set('savings_goal_id', goal.id);
    return createSavingsWithdrawal(fd);
  }

  function changeStatus(status: 'paused' | 'completed' | 'cancelled' | 'active') {
    startTransition(async () => {
      await setSavingsGoalStatus(goal.id, status);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {goal.status === 'active' && (
        <>
          <Button onClick={() => setContributeOpen(true)}>Aportar</Button>
          <Button variant="secondary" onClick={() => setWithdrawOpen(true)}>
            Retirar
          </Button>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
          <Button variant="ghost" onClick={() => changeStatus('paused')} disabled={pending}>
            Pausar
          </Button>
          <Button variant="ghost" onClick={() => changeStatus('completed')} disabled={pending}>
            Completar
          </Button>
          <Button variant="danger" onClick={() => changeStatus('cancelled')} disabled={pending}>
            Cancelar
          </Button>
        </>
      )}
      {goal.status === 'paused' && (
        <Button onClick={() => changeStatus('active')} disabled={pending}>
          Reactivar
        </Button>
      )}

      <Dialog open={contributeOpen} onClose={() => setContributeOpen(false)} title="Aportar a la meta">
        <ActionForm action={contributeWithGoal} onSuccess={() => setContributeOpen(false)} submitLabel="Aportar">
          <div>
            <Label htmlFor="contrib-amount">Monto</Label>
            <Input id="contrib-amount" name="amount" required />
          </div>
          <div>
            <Label htmlFor="contrib-date">Fecha</Label>
            <DatePicker id="contrib-date" name="transaction_date" defaultValue={todayISO()} required />
          </div>
          <div>
            <Label htmlFor="contrib-desc">Descripcion</Label>
            <Input id="contrib-desc" name="description" defaultValue={`Aporte a ${goal.name}`} required />
          </div>
          <div>
            <Label htmlFor="contrib-account">Cuenta origen (opcional)</Label>
            <Select
              id="contrib-account"
              name="source_account_id"
              placeholder="Sin cuenta"
              options={[{ value: '', label: 'Sin cuenta' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
            />
          </div>
        </ActionForm>
      </Dialog>

      <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Retirar de la meta">
        <ActionForm action={withdrawWithGoal} onSuccess={() => setWithdrawOpen(false)} submitLabel="Retirar">
          <div>
            <Label htmlFor="withdraw-amount">Monto</Label>
            <Input id="withdraw-amount" name="amount" required />
          </div>
          <div>
            <Label htmlFor="withdraw-date">Fecha</Label>
            <DatePicker id="withdraw-date" name="transaction_date" defaultValue={todayISO()} required />
          </div>
          <div>
            <Label htmlFor="withdraw-desc">Descripcion</Label>
            <Input id="withdraw-desc" name="description" defaultValue={`Retiro de ${goal.name}`} required />
          </div>
          <div>
            <Label htmlFor="withdraw-account">Cuenta destino (opcional)</Label>
            <Select
              id="withdraw-account"
              name="destination_account_id"
              placeholder="Sin cuenta"
              options={[{ value: '', label: 'Sin cuenta' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
            />
          </div>
        </ActionForm>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar meta">
        <ActionForm action={(fd) => updateSavingsGoal(goal.id, fd)} onSuccess={() => setEditOpen(false)}>
          <div>
            <Label htmlFor="edit-goal-name">Nombre</Label>
            <Input id="edit-goal-name" name="name" defaultValue={goal.name} required />
          </div>
          <div>
            <Label htmlFor="edit-goal-target">Monto objetivo</Label>
            <Input id="edit-goal-target" name="target_amount" defaultValue={(goal.target_amount_minor / 100).toFixed(2)} required />
          </div>
          <div>
            <Label htmlFor="edit-goal-date">Fecha objetivo</Label>
            <DatePicker id="edit-goal-date" name="target_date" defaultValue={goal.target_date ?? undefined} placeholder="Sin fecha objetivo" />
          </div>
          <div>
            <Label htmlFor="edit-goal-priority">Prioridad</Label>
            <Select
              id="edit-goal-priority"
              name="priority"
              defaultValue={goal.priority}
              options={[
                { value: 'low', label: 'Baja' },
                { value: 'medium', label: 'Media' },
                { value: 'high', label: 'Alta' },
              ]}
            />
          </div>
          <div className="flex items-center gap-[8px]">
            <Checkbox id="edit-goal-exclude" name="exclude_from_available_balance" defaultChecked={goal.exclude_from_available_balance} />
            <Label htmlFor="edit-goal-exclude" className="mb-0">
              Excluir del saldo disponible
            </Label>
          </div>
        </ActionForm>
      </Dialog>
    </div>
  );
}
