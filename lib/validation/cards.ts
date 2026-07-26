import { z } from 'zod';
import { dayOfMonthSchema, lastFourSchema, nonNegativeMoneyString } from './money';

export const cardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  institution_name: z.string().optional().or(z.literal('')),
  last_four: lastFourSchema,
  currency: z.string().min(1).default('GTQ'),
  credit_limit: nonNegativeMoneyString,
  current_balance: nonNegativeMoneyString,
  statement_day: dayOfMonthSchema,
  payment_due_day: dayOfMonthSchema,
  minimum_payment: nonNegativeMoneyString.optional().or(z.literal('')),
  annual_interest_rate: z.string().optional().or(z.literal('')),
});
export type CardInput = z.infer<typeof cardSchema>;

export const cardPaymentSchema = z.object({
  source_account_id: z.string().min(1, 'Selecciona una cuenta'),
  amount: nonNegativeMoneyString,
  transaction_date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(1, 'La descripcion es requerida'),
  confirm_exceeds_balance: z.boolean().optional(),
});
export type CardPaymentInput = z.infer<typeof cardPaymentSchema>;
