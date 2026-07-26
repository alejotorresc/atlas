import { z } from 'zod';
import { dayOfMonthSchema, lastFourSchema, nonNegativeMoneyString } from './money';

const percentageString = z
  .string()
  .regex(/^\d+(\.\d{1,4})?$/, 'Porcentaje invalido')
  .refine((v) => parseFloat(v) > 0 && parseFloat(v) <= 100, 'El porcentaje debe estar entre 0 y 100');

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
  interest_calculation_method: z.enum(['statement_balance', 'average_daily_balance']).default('statement_balance'),
  interest_free_days: z.coerce.number().int().min(0).max(90).default(21),
  minimum_payment_percentage: percentageString.optional().or(z.literal('')),
  late_fee: nonNegativeMoneyString.optional().or(z.literal('')),
  annual_fee: nonNegativeMoneyString.optional().or(z.literal('')),
  in_payment_agreement: z.boolean().optional(),
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
