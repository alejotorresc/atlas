import { z } from 'zod';
import { nonNegativeMoneyString } from './money';

export const budgetSchema = z.object({
  category_id: z.string().min(1, 'Selecciona una categoria'),
  month: z.string().min(1, 'El mes es requerido'),
  budget_amount: nonNegativeMoneyString,
  rollover_enabled: z.boolean().default(false),
});
export type BudgetInput = z.infer<typeof budgetSchema>;
