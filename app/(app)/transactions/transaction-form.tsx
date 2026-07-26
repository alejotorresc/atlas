'use client';

import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CreditCard,
  Landmark,
  PiggyBank,
  SlidersHorizontal,
  Undo2,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Modal } from '@/components/design-system/Modal';
import { Combobox, type ComboboxOption } from '@/components/design-system/Combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/design-system/SegmentedControl';
import { Icon } from '@/components/design-system/Icon';
import { todayISO } from '@/lib/dates/format';
import { positiveMoneyString, nonNegativeMoneyString } from '@/lib/validation/money';
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
import type { Account, Category, CreditCard as CreditCardType, SavingsGoal } from '@/types/database';

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

type FieldKey = 'account_id' | 'credit_card_id' | 'source_account_id' | 'destination_account_id' | 'category_id' | 'savings_goal_id' | 'merchant';

interface Props {
  accounts: Account[];
  cards: CreditCardType[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  savingsGoals: SavingsGoal[];
  defaultOpen?: boolean;
}

const baseFields = {
  transaction_date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(1, 'La descripcion es requerida'),
  status: z.enum(['pending', 'cleared']),
};

const requireOneOf = (a: string, b: string) => (data: Record<string, string>) => !!data[a] || !!data[b];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCHEMAS: Record<TxType, any> = {
  income: z.object({ ...baseFields, amount: positiveMoneyString, account_id: z.string().min(1, 'Selecciona una cuenta'), category_id: z.string().optional() }),
  account_expense: z.object({
    ...baseFields,
    amount: positiveMoneyString,
    account_id: z.string().min(1, 'Selecciona una cuenta'),
    category_id: z.string().optional(),
  }),
  card_expense: z.object({
    ...baseFields,
    amount: positiveMoneyString,
    credit_card_id: z.string().min(1, 'Selecciona una tarjeta'),
    category_id: z.string().optional(),
  }),
  transfer: z
    .object({
      ...baseFields,
      amount: positiveMoneyString,
      source_account_id: z.string().min(1, 'Selecciona la cuenta origen'),
      destination_account_id: z.string().min(1, 'Selecciona la cuenta destino'),
    })
    .refine((d) => d.source_account_id !== d.destination_account_id, {
      message: 'No se puede transferir a la misma cuenta',
      path: ['destination_account_id'],
    }),
  card_payment: z.object({
    ...baseFields,
    amount: positiveMoneyString,
    source_account_id: z.string().min(1, 'Selecciona una cuenta'),
    credit_card_id: z.string().min(1, 'Selecciona una tarjeta'),
  }),
  savings_contribution: z.object({
    ...baseFields,
    amount: positiveMoneyString,
    savings_goal_id: z.string().min(1, 'Selecciona una meta'),
    source_account_id: z.string().optional(),
  }),
  savings_withdrawal: z.object({
    ...baseFields,
    amount: positiveMoneyString,
    savings_goal_id: z.string().min(1, 'Selecciona una meta'),
    destination_account_id: z.string().optional(),
  }),
  refund: z
    .object({
      ...baseFields,
      amount: positiveMoneyString,
      account_id: z.string().optional(),
      credit_card_id: z.string().optional(),
      category_id: z.string().optional(),
    })
    .refine(requireOneOf('account_id', 'credit_card_id'), { message: 'Selecciona una cuenta o tarjeta', path: ['account_id'] }),
  adjustment: z
    .object({
      transaction_date: z.string().min(1, 'La fecha es requerida'),
      description: z.string().min(1, 'La descripcion es requerida'),
      amount: nonNegativeMoneyString,
      account_id: z.string().optional(),
      credit_card_id: z.string().optional(),
    })
    .refine(requireOneOf('account_id', 'credit_card_id'), { message: 'Selecciona una cuenta o tarjeta', path: ['account_id'] }),
};

interface TypeMeta {
  label: string;
  icon: LucideIcon;
  fields: FieldKey[];
  optionalFields: FieldKey[];
  amountLabel: string;
  submitLabel: string;
  action: (fd: FormData) => Promise<{ error?: string; success?: boolean }>;
}

function buildTypeMeta(): Record<TxType, TypeMeta> {
  return {
    income: {
      label: 'Ingreso',
      icon: ArrowDownLeft,
      fields: ['account_id', 'category_id'],
      optionalFields: ['category_id'],
      amountLabel: 'Monto',
      submitLabel: 'Registrar',
      action: createIncome,
    },
    account_expense: {
      label: 'Gasto desde cuenta',
      icon: ArrowUpRight,
      fields: ['account_id', 'category_id'],
      optionalFields: ['category_id'],
      amountLabel: 'Monto',
      submitLabel: 'Registrar',
      action: createAccountExpense,
    },
    card_expense: {
      label: 'Gasto con tarjeta',
      icon: CreditCard,
      fields: ['credit_card_id', 'category_id'],
      optionalFields: ['category_id'],
      amountLabel: 'Monto',
      submitLabel: 'Registrar',
      action: createCardExpense,
    },
    transfer: {
      label: 'Transferencia entre cuentas',
      icon: ArrowLeftRight,
      fields: ['source_account_id', 'destination_account_id'],
      optionalFields: [],
      amountLabel: 'Monto',
      submitLabel: 'Transferir',
      action: createTransfer,
    },
    card_payment: {
      label: 'Pago de tarjeta de credito',
      icon: Landmark,
      fields: ['source_account_id', 'credit_card_id'],
      optionalFields: [],
      amountLabel: 'Monto',
      submitLabel: 'Pagar',
      action: createCardPayment,
    },
    savings_contribution: {
      label: 'Aporte a ahorro',
      icon: PiggyBank,
      fields: ['savings_goal_id', 'source_account_id'],
      optionalFields: ['source_account_id'],
      amountLabel: 'Monto',
      submitLabel: 'Aportar',
      action: createSavingsContribution,
    },
    savings_withdrawal: {
      label: 'Retiro de ahorro',
      icon: Wallet,
      fields: ['savings_goal_id', 'destination_account_id'],
      optionalFields: ['destination_account_id'],
      amountLabel: 'Monto',
      submitLabel: 'Retirar',
      action: createSavingsWithdrawal,
    },
    refund: {
      label: 'Reembolso',
      icon: Undo2,
      fields: ['account_id', 'credit_card_id', 'category_id'],
      optionalFields: ['account_id', 'credit_card_id', 'category_id'],
      amountLabel: 'Monto',
      submitLabel: 'Registrar',
      action: createRefund,
    },
    adjustment: {
      label: 'Ajuste de saldo',
      icon: SlidersHorizontal,
      fields: ['account_id', 'credit_card_id'],
      optionalFields: ['account_id', 'credit_card_id'],
      amountLabel: 'Nuevo saldo',
      submitLabel: 'Ajustar',
      action: createAdjustment,
    },
  };
}

const FIELD_LABELS: Record<FieldKey, string> = {
  account_id: 'Cuenta',
  credit_card_id: 'Tarjeta',
  source_account_id: 'Cuenta origen',
  destination_account_id: 'Cuenta destino',
  category_id: 'Categoria',
  savings_goal_id: 'Meta de ahorro',
  merchant: 'Comercio',
};

export function NewTransactionButton(props: Props) {
  const [open, setOpen] = useState(!!props.defaultOpen);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Registrar movimiento</Button>
      {open && <TransactionModal {...props} onClose={() => setOpen(false)} />}
    </>
  );
}

function TransactionModal({ accounts, cards, incomeCategories, expenseCategories, savingsGoals, onClose }: Props & { onClose: () => void }) {
  const [type, setType] = useState<TxType>('account_expense');
  const typeMeta = buildTypeMeta();
  const meta = typeMeta[type];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(SCHEMAS[type]) as Resolver<Record<string, string>>,
    defaultValues: {
      transaction_date: todayISO(),
      status: 'cleared',
      amount: '',
      description: '',
      account_id: '',
      credit_card_id: '',
      source_account_id: '',
      destination_account_id: '',
      category_id: '',
      savings_goal_id: '',
    },
  });

  // Reset field-specific values when the type changes so stale selections
  // from a different shape (e.g. a chosen category) don't linger unseen.
  useEffect(() => {
    setValue('account_id', '');
    setValue('credit_card_id', '');
    setValue('source_account_id', '');
    setValue('destination_account_id', '');
    setValue('category_id', '');
    setValue('savings_goal_id', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const values = watch();

  async function onSubmit(data: Record<string, string>) {
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => fd.set(key, value ?? ''));
    const result = await meta.action(fd);
    if (result.error) {
      setError('root', { message: result.error });
      return;
    }
    onClose();
  }

  const accountOptions: ComboboxOption[] = accounts.map((a) => ({ value: a.id, label: a.name }));
  const cardOptions: ComboboxOption[] = cards.map((c) => ({ value: c.id, label: c.name }));
  const goalOptions: ComboboxOption[] = savingsGoals.map((g) => ({ value: g.id, label: g.name }));
  const categoryOptions: ComboboxOption[] =
    type === 'income'
      ? incomeCategories.map((c) => ({ value: c.id, label: c.name }))
      : expenseCategories.map((c) => ({ value: c.id, label: c.name }));

  function optionsFor(field: FieldKey): ComboboxOption[] {
    switch (field) {
      case 'account_id':
      case 'source_account_id':
      case 'destination_account_id':
        return accountOptions;
      case 'credit_card_id':
        return cardOptions;
      case 'savings_goal_id':
        return goalOptions;
      case 'category_id':
        return categoryOptions;
      default:
        return [];
    }
  }

  const rootError = (errors as { root?: { message?: string } }).root?.message;

  return (
    <Modal
      open
      onOpenChange={(next) => !next && onClose()}
      title="Registrar movimiento"
      widthClassName="w-[calc(100vw-32px)] sm:w-[680px]"
      footer={
        <div className="flex items-center justify-between gap-[12px]">
          {rootError ? <p className="text-[13px] text-[var(--ds-color-danger-text)]">{rootError}</p> : <span />}
          <div className="flex gap-[8px]">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" form="transaction-form" loading={isSubmitting}>
              {meta.submitLabel}
            </Button>
          </div>
        </div>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-[24px] py-[8px]">
        {/* Amount — the visual focus */}
        <div>
          <div className="flex items-center gap-[8px] text-[13px] font-medium text-[var(--ds-neutral-500)]">
            <Icon icon={meta.icon} size="sm" className="text-[var(--ds-color-primary)]" />
            {meta.amountLabel}
          </div>
          <div className="mt-[4px] flex items-center gap-[8px]">
            <span className="font-display text-[40px] font-medium leading-[46px] text-[var(--ds-neutral-300)]">Q</span>
            <input
              {...register('amount')}
              autoFocus
              inputMode="decimal"
              placeholder="0.00"
              aria-invalid={!!errors.amount}
              className="font-display w-full bg-transparent text-[40px] font-medium leading-[46px] tracking-[-0.01em] text-[var(--ds-neutral-900)] placeholder:text-[var(--ds-neutral-300)] focus:outline-none"
            />
          </div>
          {errors.amount && <p className="mt-[6px] text-[13px] text-[var(--ds-color-danger-text)]">{String(errors.amount.message)}</p>}
        </div>

        <div className="grid gap-[24px] md:grid-cols-2">
          {/* Left column: what kind of movement */}
          <div className="space-y-[16px]">
            <div>
              <Label>Tipo de movimiento</Label>
              <Combobox
                value={type}
                onValueChange={(v) => setType(v as TxType)}
                options={Object.entries(typeMeta).map(([value, m]) => ({ value, label: m.label }))}
                searchPlaceholder="Buscar tipo..."
              />
            </div>

            {type !== 'adjustment' && (
              <div>
                <Label>Estado</Label>
                <SegmentedControl
                  name="status"
                  value={values.status ?? 'cleared'}
                  onChange={(v) => setValue('status', v)}
                  options={[
                    { value: 'cleared', label: 'Confirmado' },
                    { value: 'pending', label: 'Pendiente' },
                  ]}
                />
              </div>
            )}
          </div>

          {/* Right column: contextual fields for the chosen type */}
          <div className="relative">
            <AnimatePresence initial={false}>
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, position: 'absolute' }}
                transition={{ duration: 0.14 }}
                className="w-full space-y-[16px]"
              >
                {meta.fields
                  .filter((f) => f !== 'merchant')
                  .map((field) => (
                    <div key={field}>
                      <Label>
                        {FIELD_LABELS[field]}
                        {meta.optionalFields.includes(field) && ' (opcional)'}
                      </Label>
                      <Combobox
                        value={values[field] ?? ''}
                        onValueChange={(v) => setValue(field, v, { shouldValidate: true })}
                        options={optionsFor(field)}
                        placeholder={`Selecciona ${field === 'credit_card_id' ? 'una tarjeta' : field === 'savings_goal_id' ? 'una meta' : 'una opcion'}`}
                        aria-invalid={!!errors[field]}
                      />
                      {errors[field] && <p className="mt-[6px] text-[13px] text-[var(--ds-color-danger-text)]">{String(errors[field]?.message)}</p>}
                    </div>
                  ))}

                <div>
                  <Label>Fecha</Label>
                  <DatePicker defaultValue={todayISO()} onChange={(v) => setValue('transaction_date', v, { shouldValidate: true })} />
                  {errors.transaction_date && <p className="mt-[6px] text-[13px] text-[var(--ds-color-danger-text)]">{String(errors.transaction_date.message)}</p>}
                </div>

                <div>
                  <Label>Descripcion</Label>
                  <Input {...register('description')} placeholder="Ej. Supermercado" aria-invalid={!!errors.description} />
                  {errors.description && <p className="mt-[6px] text-[13px] text-[var(--ds-color-danger-text)]">{String(errors.description.message)}</p>}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </form>
    </Modal>
  );
}
