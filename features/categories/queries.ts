import { createClient } from '@/lib/supabase/server';
import type { Category, CategoryType } from '@/types/database';

export async function listCategories(userId: string, type?: CategoryType): Promise<Category[]> {
  const supabase = await createClient();
  let query = supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${userId},and(user_id.is.null,is_system.eq.true)`)
    .eq('is_archived', false)
    .order('name');
  if (type) query = query.eq('category_type', type);
  const { data } = await query;
  return data ?? [];
}
