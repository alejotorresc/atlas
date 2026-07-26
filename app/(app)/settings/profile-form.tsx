'use client';

import { ActionForm } from '@/components/forms/action-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from '@/features/profile/actions';
import type { Profile } from '@/types/database';

export function ProfileForm({ profile }: { profile: Profile }) {
  return (
    <ActionForm action={updateProfile}>
      <div>
        <Label htmlFor="settings-display-name">Nombre para mostrar</Label>
        <Input id="settings-display-name" name="display_name" defaultValue={profile.display_name ?? ''} required />
      </div>
      <div>
        <Label htmlFor="settings-currency">Moneda principal</Label>
        <Input id="settings-currency" name="primary_currency" defaultValue={profile.primary_currency} />
      </div>
      <div>
        <Label htmlFor="settings-locale">Idioma / region</Label>
        <Input id="settings-locale" name="locale" defaultValue={profile.locale} />
      </div>
      <div>
        <Label htmlFor="settings-timezone">Zona horaria</Label>
        <Input id="settings-timezone" name="timezone" defaultValue={profile.timezone} />
      </div>
    </ActionForm>
  );
}
