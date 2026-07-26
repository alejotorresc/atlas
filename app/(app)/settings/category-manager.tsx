'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { ActionForm } from '@/components/forms/action-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { archiveCategory, createCategory, updateCategory } from '@/features/categories/actions';
import type { Category } from '@/types/database';

const TYPE_LABELS: Record<string, string> = { income: 'Ingreso', expense: 'Gasto', savings: 'Ahorro' };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pending, startTransition] = useTransition();

  function handleArchive(category: Category) {
    if (!confirm(`Archivar/eliminar la categoria "${category.name}"?`)) return;
    startTransition(async () => {
      await archiveCategory(category.id);
      router.refresh();
    });
  }

  return (
    <div>
      <Button onClick={() => setCreateOpen(true)}>Nueva categoria</Button>

      <ul className="mt-4 divide-y divide-[var(--ds-neutral-100)] rounded-lg border border-[var(--ds-neutral-200)] bg-[var(--ds-color-surface)]">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <div className="flex items-center gap-2">
              <span>{c.name}</span>
              <Badge tone="neutral">{TYPE_LABELS[c.category_type]}</Badge>
              {c.is_system && <Badge tone="info">Sistema</Badge>}
              {c.is_archived && <Badge tone="warning">Archivada</Badge>}
            </div>
            {!c.is_system && (
              <div className="flex gap-2">
                <button type="button" className="text-xs text-[var(--ds-neutral-600)] underline" onClick={() => setEditing(c)}>
                  Editar
                </button>
                <button type="button" className="text-xs text-[var(--ds-color-danger-text)] underline" disabled={pending} onClick={() => handleArchive(c)}>
                  Archivar/eliminar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva categoria">
        <ActionForm action={createCategory} onSuccess={() => setCreateOpen(false)} submitLabel="Crear">
          <div>
            <Label htmlFor="cat-name">Nombre</Label>
            <Input id="cat-name" name="name" required />
          </div>
          <div>
            <Label htmlFor="cat-type">Tipo</Label>
            <Select id="cat-type" name="category_type" defaultValue="expense">
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
              <option value="savings">Ahorro</option>
            </Select>
          </div>
        </ActionForm>
      </Dialog>

      <Dialog open={!!editing} onClose={() => setEditing(null)} title="Editar categoria">
        {editing && (
          <ActionForm action={(fd) => updateCategory(editing.id, fd)} onSuccess={() => setEditing(null)}>
            <div>
              <Label htmlFor="edit-cat-name">Nombre</Label>
              <Input id="edit-cat-name" name="name" defaultValue={editing.name} required />
            </div>
            <div>
              <Label htmlFor="edit-cat-type">Tipo</Label>
              <Select id="edit-cat-type" name="category_type" defaultValue={editing.category_type}>
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
                <option value="savings">Ahorro</option>
              </Select>
            </div>
          </ActionForm>
        )}
      </Dialog>
    </div>
  );
}
