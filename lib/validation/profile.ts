import { z } from 'zod';
import { positiveMoneyString } from './money';

export const profileSchema = z.object({
  display_name: z.string().min(1, 'El nombre es requerido'),
  primary_currency: z.string().min(1).default('GTQ'),
  locale: z.string().min(1).default('es-GT'),
  timezone: z.string().min(1).default('America/Guatemala'),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const financialPreferencesSchema = z.object({
  default_obligation_horizon_days: z.coerce.number().int().min(1).max(90),
  pending_affects_safe_to_spend: z.boolean(),
});
export type FinancialPreferencesInput = z.infer<typeof financialPreferencesSchema>;

export const onboardingIncomeSchema = z.object({
  description: z.string().min(1, 'La descripcion es requerida'),
  amount: positiveMoneyString,
  next_due_date: z.string().min(1, 'La fecha es requerida'),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
});
export type OnboardingIncomeInput = z.infer<typeof onboardingIncomeSchema>;
