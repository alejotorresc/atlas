import { z } from 'zod';
import { positiveMoneyString } from './money';

export const obligationSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  obligation_type: z.enum(['bill', 'subscription', 'rent', 'loan', 'insurance', 'card_payment', 'savings', 'other']),
  amount_type: z.enum(['fixed', 'estimated']).default('fixed'),
  amount: positiveMoneyString,
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
  next_due_date: z.string().min(1, 'La fecha es requerida'),
  end_date: z.string().optional().or(z.literal('')),
  account_id: z.string().optional().or(z.literal('')),
  credit_card_id: z.string().optional().or(z.literal('')),
  category_id: z.string().optional().or(z.literal('')),
  reminder_days_before: z.coerce.number().int().min(0).max(30).default(3),
});
export type ObligationInput = z.infer<typeof obligationSchema>;

export const markPaidSchema = z.object({
  account_id: z.string().optional().or(z.literal('')),
  credit_card_id: z.string().optional().or(z.literal('')),
  actual_amount: positiveMoneyString,
  transaction_date: z.string().min(1, 'La fecha es requerida'),
});
export type MarkPaidInput = z.infer<typeof markPaidSchema>;
