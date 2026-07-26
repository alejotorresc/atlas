import { z } from 'zod';
import { positiveMoneyString } from './money';

export const transactionStatusSchema = z.enum(['pending', 'cleared']);

const base = {
  amount: positiveMoneyString,
  transaction_date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(1, 'La descripcion es requerida'),
  merchant: z.string().optional().or(z.literal('')),
  status: transactionStatusSchema.default('cleared'),
};

export const incomeSchema = z.object({
  ...base,
  account_id: z.string().min(1, 'Selecciona una cuenta'),
  category_id: z.string().optional().or(z.literal('')),
});
export type IncomeInput = z.infer<typeof incomeSchema>;

export const accountExpenseSchema = z.object({
  ...base,
  account_id: z.string().min(1, 'Selecciona una cuenta'),
  category_id: z.string().optional().or(z.literal('')),
});
export type AccountExpenseInput = z.infer<typeof accountExpenseSchema>;

export const cardExpenseSchema = z.object({
  ...base,
  credit_card_id: z.string().min(1, 'Selecciona una tarjeta'),
  category_id: z.string().optional().or(z.literal('')),
});
export type CardExpenseInput = z.infer<typeof cardExpenseSchema>;

export const transferSchema = z
  .object({
    amount: positiveMoneyString,
    transaction_date: z.string().min(1, 'La fecha es requerida'),
    description: z.string().min(1, 'La descripcion es requerida'),
    status: transactionStatusSchema.default('cleared'),
    source_account_id: z.string().min(1, 'Selecciona la cuenta origen'),
    destination_account_id: z.string().min(1, 'Selecciona la cuenta destino'),
  })
  .refine((data) => data.source_account_id !== data.destination_account_id, {
    message: 'No se puede transferir a la misma cuenta',
    path: ['destination_account_id'],
  });
export type TransferInput = z.infer<typeof transferSchema>;

export const cardPaymentTxSchema = z.object({
  ...base,
  source_account_id: z.string().min(1, 'Selecciona una cuenta'),
  credit_card_id: z.string().min(1, 'Selecciona una tarjeta'),
});
export type CardPaymentTxInput = z.infer<typeof cardPaymentTxSchema>;

export const savingsContributionSchema = z.object({
  ...base,
  savings_goal_id: z.string().min(1, 'Selecciona una meta'),
  source_account_id: z.string().optional().or(z.literal('')),
});
export type SavingsContributionInput = z.infer<typeof savingsContributionSchema>;

export const savingsWithdrawalSchema = z.object({
  ...base,
  savings_goal_id: z.string().min(1, 'Selecciona una meta'),
  destination_account_id: z.string().optional().or(z.literal('')),
});
export type SavingsWithdrawalInput = z.infer<typeof savingsWithdrawalSchema>;

export const refundSchema = z.object({
  ...base,
  account_id: z.string().optional().or(z.literal('')),
  credit_card_id: z.string().optional().or(z.literal('')),
  category_id: z.string().optional().or(z.literal('')),
});
export type RefundInput = z.infer<typeof refundSchema>;
