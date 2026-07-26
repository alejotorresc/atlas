import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category_type: z.enum(['income', 'expense', 'savings']),
});
export type CategoryInput = z.infer<typeof categorySchema>;
