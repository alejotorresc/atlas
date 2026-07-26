import { z } from 'zod';

/** Positive decimal string like "125.50", validated before conversion to minor units. */
export const positiveMoneyString = z
  .string()
  .min(1, 'El monto es requerido')
  .regex(/^\d+(\.\d{1,2})?$/, 'Monto invalido')
  .refine((v) => parseFloat(v) > 0, 'El monto debe ser mayor a cero');

export const nonNegativeMoneyString = z
  .string()
  .min(1, 'El monto es requerido')
  .regex(/^-?\d+(\.\d{1,2})?$/, 'Monto invalido');

export const dayOfMonthSchema = z
  .number()
  .int('Dia invalido')
  .min(1, 'El dia debe estar entre 1 y 31')
  .max(31, 'El dia debe estar entre 1 y 31');

export const lastFourSchema = z
  .string()
  .regex(/^\d{4}$/, 'Debe tener exactamente 4 digitos')
  .optional()
  .or(z.literal(''));
