'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { todayISO } from '@/lib/dates/format';
import {
  createAccountExpense,
  createAdjustment,
  createCardExpense,
  createCardPayment,
  createIncome,
  createRefund,
  createSavingsContribution,
  createSavingsWithdrawal,
  createTransfer,
} from '@/features/transactions/actions';
import type { Account, Category, CreditCard, SavingsGoal } from '@/types/database';

type TxType =
  | 'income'
  | 'account_expense'
  | 'card_expense'
  | 'transfer'
  | 'card_payment'
  | 'savings_contribution'
  | 'savings_withdrawal'
  | 'refund'
  | 'adjustment';

const TYPE_LABELS: Record<TxType, string> = {
  income: 'Ingreso',
  account_expense: 'Gasto desde cuenta',
  card_expense: 'Gasto con tarjeta',
  transfer: 'Transferencia entre cuentas',
  card_payment: 'Pago de tarjeta de credito',
  savings_contribution: 'Aporte a ahorro',
  savings_withdrawal: 'Retiro de ahorro',
  refund: 'Reembolso',
  adjustment: 'Ajuste de saldo',
};

interface Props {
  accounts: Account[];
  cards: CreditCard[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  savingsGoals: SavingsGoal[];
  defaultOpen?: boolean;
}

export function NewTransactionButton(props: Props) {
  const [open, setOpen] = useState(!!props.defaultOpen);
  const [type, setType] = useState<TxType>('account_expense');

  return (
    <>
      <Button onClick={() => setOpen(true)}>Registrar movimiento</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Registrar movimiento">
        <div className="mb-4">
          <Label htmlFor="tx-type">Tipo de movimiento</Label>
          <Select id="tx-type" value={type} onChange={(e) => setType(e.target.value as TxType)}>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <TransactionFields type={type} {...props} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

function TransactionFields({ type, accounts, cards, incomeCategories, expenseCategories, savingsGoals, onDone }: Props & { type: TxType; onDone: () => void }) {
  const common = (
    <>
      <div>
        <Label htmlFor="tx-amount">Monto</Label>
        <Input id="tx-amount" name="amount" required placeholder="0.00" />
      </div>
      <div>
        <Label htmlFor="tx-date">Fecha</Label>
        <Input id="tx-date" name="transaction_date" type="date" defaultValue={todayISO()} required />
      </div>
      <div>
        <Label htmlFor="tx-desc">Descripcion</Label>
        <Input id="tx-desc" name="description" required />
      </div>
      <div>
        <Label htmlFor="tx-status">Estado</Label>
        <Select id="tx-status" name="status" defaultValue="cleared">
          <option value="cleared">Confirmado</option>
          <option value="pending">Pendiente</option>
        </Select>
      </div>
    </>
  );

  if (type === 'income') {
    return (
      <ActionForm action={createIncome} onSuccess={onDone}>
        {common}
        <div>
          <Label htmlFor="tx-account">Cuenta</Label>
          <Select id="tx-account" name="account_id" required>
            <option value="">Selecciona una cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <CategorySelect categories={incomeCategories} />
      </ActionForm>
    );
  }

  if (type === 'account_expense') {
    return (
      <ActionForm action={createAccountExpense} onSuccess={onDone}>
        {common}
        <div>
          <Label htmlFor="tx-account">Cuenta</Label>
          <Select id="tx-account" name="account_id" required>
            <option value="">Selecciona una cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <CategorySelect categories={expenseCategories} />
      </ActionForm>
    );
  }

  if (type === 'card_expense') {
    return (
      <ActionForm action={createCardExpense} onSuccess={onDone}>
        {common}
        <div>
          <Label htmlFor="tx-card">Tarjeta</Label>
          <Select id="tx-card" name="credit_card_id" required>
            <option value="">Selecciona una tarjeta</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <CategorySelect categories={expenseCategories} />
      </ActionForm>
    );
  }

  if (type === 'transfer') {
    return (
      <ActionForm action={createTransfer} onSuccess={onDone}>
        {common}
        <div>
          <Label htmlFor="tx-src">Cuenta origen</Label>
          <Select id="tx-src" name="source_account_id" required>
            <option value="">Selecciona una cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tx-dst">Cuenta destino</Label>
          <Select id="tx-dst" name="destination_account_id" required>
            <option value="">Selecciona una cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-xs text-[var(--ds-neutral-500)]">
          Esto disminuira el saldo de la cuenta origen y aumentara el de la cuenta destino por el mismo monto. No se
          contabiliza como ingreso ni gasto.
        </p>
      </ActionForm>
    );
  }

  if (type === 'card_payment') {
    return (
      <ActionForm action={createCardPayment} onSuccess={onDone} submitLabel="Pagar">
        {common}
        <div>
          <Label htmlFor="tx-pay-src">Cuenta origen</Label>
          <Select id="tx-pay-src" name="source_account_id" required>
            <option value="">Selecciona una cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tx-pay-card">Tarjeta</Label>
          <Select id="tx-pay-card" name="credit_card_id" required>
            <option value="">Selecciona una tarjeta</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-xs text-[var(--ds-neutral-500)]">
          Esto disminuira el saldo de la cuenta origen y el saldo de la tarjeta. No se contabiliza como gasto nuevo.
        </p>
      </ActionForm>
    );
  }

  if (type === 'savings_contribution') {
    return (
      <ActionForm action={createSavingsContribution} onSuccess={onDone}>
        {common}
        <div>
          <Label htmlFor="tx-goal">Meta de ahorro</Label>
          <Select id="tx-goal" name="savings_goal_id" required>
            <option value="">Selecciona una meta</option>
            {savingsGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tx-source-account">Cuenta origen (opcional)</Label>
          <Select id="tx-source-account" name="source_account_id">
            <option value="">Sin cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
      </ActionForm>
    );
  }

  if (type === 'savings_withdrawal') {
    return (
      <ActionForm action={createSavingsWithdrawal} onSuccess={onDone}>
        {common}
        <div>
          <Label htmlFor="tx-goal">Meta de ahorro</Label>
          <Select id="tx-goal" name="savings_goal_id" required>
            <option value="">Selecciona una meta</option>
            {savingsGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tx-dest-account">Cuenta destino (opcional)</Label>
          <Select id="tx-dest-account" name="destination_account_id">
            <option value="">Sin cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
      </ActionForm>
    );
  }

  if (type === 'refund') {
    return (
      <ActionForm action={createRefund} onSuccess={onDone}>
        {common}
        <div>
          <Label htmlFor="tx-refund-account">Cuenta (si aplica)</Label>
          <Select id="tx-refund-account" name="account_id">
            <option value="">Ninguna</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tx-refund-card">Tarjeta (si aplica)</Label>
          <Select id="tx-refund-card" name="credit_card_id">
            <option value="">Ninguna</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <CategorySelect categories={expenseCategories} />
      </ActionForm>
    );
  }

  // adjustment
  return (
    <ActionForm action={createAdjustment} onSuccess={onDone} submitLabel="Ajustar">
      <div>
        <Label htmlFor="adj-tx-account">Cuenta (o deja vacio y elige tarjeta)</Label>
        <Select id="adj-tx-account" name="account_id">
          <option value="">Ninguna</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="adj-tx-card">Tarjeta</Label>
        <Select id="adj-tx-card" name="credit_card_id">
          <option value="">Ninguna</option>
          {cards.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="adj-new-balance">Nuevo saldo</Label>
        <Input id="adj-new-balance" name="new_balance" required />
      </div>
      <div>
        <Label htmlFor="adj-date">Fecha</Label>
        <Input id="adj-date" name="transaction_date" type="date" defaultValue={todayISO()} required />
      </div>
      <div>
        <Label htmlFor="adj-desc">Motivo</Label>
        <Input id="adj-desc" name="description" required />
      </div>
    </ActionForm>
  );
}

function CategorySelect({ categories }: { categories: Category[] }) {
  return (
    <div>
      <Label htmlFor="tx-category">Categoria</Label>
      <Select id="tx-category" name="category_id">
        <option value="">Sin categoria</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
