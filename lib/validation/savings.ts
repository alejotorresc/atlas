import { z } from 'zod';
import { positiveMoneyString } from './money';

export const savingsGoalSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  target_amount: positiveMoneyString,
  target_date: z.string().optional().or(z.literal('')),
  linked_account_id: z.string().optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  exclude_from_available_balance: z.boolean().default(true),
});
export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
