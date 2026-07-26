import { z } from 'zod';
import { nonNegativeMoneyString } from './money';

export const accountTypeSchema = z.enum(['checking', 'savings', 'cash', 'digital_wallet', 'investment', 'other']);

export const accountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  institution_name: z.string().optional().or(z.literal('')),
  account_type: accountTypeSchema,
  currency: z.string().min(1).default('GTQ'),
  opening_balance: nonNegativeMoneyString,
  include_in_available_balance: z.boolean().default(true),
});
export type AccountInput = z.infer<typeof accountSchema>;

export const balanceAdjustmentSchema = z.object({
  new_balance: nonNegativeMoneyString,
  description: z.string().min(1, 'La descripcion es requerida'),
  transaction_date: z.string().min(1, 'La fecha es requerida'),
});
export type BalanceAdjustmentInput = z.infer<typeof balanceAdjustmentSchema>;
