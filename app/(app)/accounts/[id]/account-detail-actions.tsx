'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ActionForm } from '@/components/forms/action-form';
import { archiveAccount, adjustAccountBalance, updateAccount } from '@/features/accounts/actions';
import { todayISO } from '@/lib/dates/format';
import type { Account } from '@/types/database';

const ACCOUNT_TYPES = [
  ['checking', 'Monetaria'],
  ['savings', 'Ahorro'],
  ['cash', 'Efectivo'],
  ['digital_wallet', 'Billetera digital'],
  ['investment', 'Inversion'],
  ['other', 'Otro'],
] as const;

export function AccountDetailActions({ account }: { account: Account }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  async function handleArchive() {
    if (!confirm('Archivar esta cuenta? No se elimina el historial.')) return;
    const result = await archiveAccount(account.id);
    if (!result.error) router.push('/accounts');
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => setEditOpen(true)}>
        Editar
      </Button>
      <Button variant="secondary" onClick={() => setAdjustOpen(true)}>
        Ajustar saldo
      </Button>
      <Button variant="danger" onClick={handleArchive}>
        Archivar
      </Button>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar cuenta">
        <ActionForm action={(fd) => updateAccount(account.id, fd)} onSuccess={() => setEditOpen(false)}>
          <div>
            <Label htmlFor="edit-name">Nombre</Label>
            <Input id="edit-name" name="name" defaultValue={account.name} required />
          </div>
          <div>
            <Label htmlFor="edit-institution">Institucion</Label>
            <Input id="edit-institution" name="institution_name" defaultValue={account.institution_name ?? ''} />
          </div>
          <div>
            <Label htmlFor="edit-type">Tipo</Label>
            <Select id="edit-type" name="account_type" defaultValue={account.account_type}>
              {ACCOUNT_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="edit-include"
              name="include_in_available_balance"
              type="checkbox"
              defaultChecked={account.include_in_available_balance}
            />
            <Label htmlFor="edit-include" className="mb-0">
              Incluir en saldo disponible
            </Label>
          </div>
        </ActionForm>
      </Dialog>

      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Ajustar saldo">
        <ActionForm action={(fd) => adjustAccountBalance(account.id, fd)} onSuccess={() => setAdjustOpen(false)} submitLabel="Ajustar">
          <div>
            <Label htmlFor="new_balance">Nuevo saldo</Label>
            <Input id="new_balance" name="new_balance" defaultValue={(account.current_balance_minor / 100).toFixed(2)} required />
          </div>
          <div>
            <Label htmlFor="adj-date">Fecha</Label>
            <Input id="adj-date" name="transaction_date" type="date" defaultValue={todayISO()} required />
          </div>
          <div>
            <Label htmlFor="adj-desc">Motivo del ajuste</Label>
            <Input id="adj-desc" name="description" placeholder="Conciliacion con banco" required />
          </div>
        </ActionForm>
      </Dialog>
    </div>
  );
}
