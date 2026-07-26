'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
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

const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));

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
          <Select id="tx-type" value={type} onValueChange={(v) => setType(v as TxType)} options={TYPE_OPTIONS} />
        </div>
        <TransactionFields type={type} {...props} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

function TransactionFields({ type, accounts, cards, incomeCategories, expenseCategories, savingsGoals, onDone }: Props & { type: TxType; onDone: () => void }) {
  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));
  const cardOptions = cards.map((c) => ({ value: c.id, label: c.name }));
  const goalOptions = savingsGoals.map((g) => ({ value: g.id, label: g.name }));

  const common = (
    <>
      <div>
        <Label htmlFor="tx-amount">Monto</Label>
        <Input id="tx-amount" name="amount" required placeholder="0.00" />
      </div>
      <div>
        <Label htmlFor="tx-date">Fecha</Label>
        <DatePicker id="tx-date" name="transaction_date" defaultValue={todayISO()} required />
      </div>
      <div>
        <Label htmlFor="tx-desc">Descripcion</Label>
        <Input id="tx-desc" name="description" required />
      </div>
      <div>
        <Label htmlFor="tx-status">Estado</Label>
        <Select
          id="tx-status"
          name="status"
          defaultValue="cleared"
          options={[
            { value: 'cleared', label: 'Confirmado' },
            { value: 'pending', label: 'Pendiente' },
          ]}
        />
      </div>
    </>
  );

  if (type === 'income') {
    return (
      <ActionForm action={createIncome} onSuccess={onDone}>
        {common}
        <div>
          <Label htmlFor="tx-account">Cuenta</Label>
          <Select id="tx-account" name="account_id" required placeholder="Selecciona una cuenta" options={accountOptions} />
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
          <Select id="tx-account" name="account_id" required placeholder="Selecciona una cuenta" options={accountOptions} />
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
          <Select id="tx-card" name="credit_card_id" required placeholder="Selecciona una tarjeta" options={cardOptions} />
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
          <Select id="tx-src" name="source_account_id" required placeholder="Selecciona una cuenta" options={accountOptions} />
        </div>
        <div>
          <Label htmlFor="tx-dst">Cuenta destino</Label>
          <Select id="tx-dst" name="destination_account_id" required placeholder="Selecciona una cuenta" options={accountOptions} />
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
          <Select id="tx-pay-src" name="source_account_id" required placeholder="Selecciona una cuenta" options={accountOptions} />
        </div>
        <div>
          <Label htmlFor="tx-pay-card">Tarjeta</Label>
          <Select id="tx-pay-card" name="credit_card_id" required placeholder="Selecciona una tarjeta" options={cardOptions} />
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
          <Select id="tx-goal" name="savings_goal_id" required placeholder="Selecciona una meta" options={goalOptions} />
        </div>
        <div>
          <Label htmlFor="tx-source-account">Cuenta origen (opcional)</Label>
          <Select
            id="tx-source-account"
            name="source_account_id"
            placeholder="Sin cuenta"
            options={[{ value: '', label: 'Sin cuenta' }, ...accountOptions]}
          />
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
          <Select id="tx-goal" name="savings_goal_id" required placeholder="Selecciona una meta" options={goalOptions} />
        </div>
        <div>
          <Label htmlFor="tx-dest-account">Cuenta destino (opcional)</Label>
          <Select
            id="tx-dest-account"
            name="destination_account_id"
            placeholder="Sin cuenta"
            options={[{ value: '', label: 'Sin cuenta' }, ...accountOptions]}
          />
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
          <Select
            id="tx-refund-account"
            name="account_id"
            placeholder="Ninguna"
            options={[{ value: '', label: 'Ninguna' }, ...accountOptions]}
          />
        </div>
        <div>
          <Label htmlFor="tx-refund-card">Tarjeta (si aplica)</Label>
          <Select id="tx-refund-card" name="credit_card_id" placeholder="Ninguna" options={[{ value: '', label: 'Ninguna' }, ...cardOptions]} />
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
        <Select id="adj-tx-account" name="account_id" placeholder="Ninguna" options={[{ value: '', label: 'Ninguna' }, ...accountOptions]} />
      </div>
      <div>
        <Label htmlFor="adj-tx-card">Tarjeta</Label>
        <Select id="adj-tx-card" name="credit_card_id" placeholder="Ninguna" options={[{ value: '', label: 'Ninguna' }, ...cardOptions]} />
      </div>
      <div>
        <Label htmlFor="adj-new-balance">Nuevo saldo</Label>
        <Input id="adj-new-balance" name="new_balance" required />
      </div>
      <div>
        <Label htmlFor="adj-date">Fecha</Label>
        <DatePicker id="adj-date" name="transaction_date" defaultValue={todayISO()} required />
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
      <Select
        id="tx-category"
        name="category_id"
        placeholder="Sin categoria"
        options={[{ value: '', label: 'Sin categoria' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
      />
    </div>
  );
}
