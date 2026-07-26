'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { categorySchema } from '@/lib/validation/categories';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    category_type: formData.get('category_type'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: parsed.data.name,
    category_type: parsed.data.category_type,
  });
  if (error) return { error: 'No se pudo crear la categoria.' };

  revalidatePath('/settings');
  return { success: true };
}

export async function updateCategory(categoryId: string, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    category_type: formData.get('category_type'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .update({ name: parsed.data.name, category_type: parsed.data.category_type })
    .eq('id', categoryId)
    .eq('user_id', user.id)
    .eq('is_system', false);
  if (error) return { error: 'No se pudo actualizar la categoria.' };

  revalidatePath('/settings');
  return { success: true };
}

export async function archiveCategory(categoryId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const supabase = await createClient();
  const { count } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('category_id', categoryId);

  if (count && count > 0) {
    const { error } = await supabase.from('categories').update({ is_archived: true }).eq('id', categoryId).eq('user_id', user.id);
    if (error) return { error: 'No se pudo archivar la categoria.' };
    revalidatePath('/settings');
    return { success: true };
  }

  const { error } = await supabase.from('categories').delete().eq('id', categoryId).eq('user_id', user.id).eq('is_system', false);
  if (error) return { error: 'No se pudo eliminar la categoria.' };

  revalidatePath('/settings');
  return { success: true };
}
