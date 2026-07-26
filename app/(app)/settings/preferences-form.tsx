'use client';

import { ActionForm } from '@/components/forms/action-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { updateFinancialPreferences } from '@/features/profile/actions';
import type { Profile } from '@/types/database';

export function PreferencesForm({ profile }: { profile: Profile }) {
  return (
    <ActionForm action={updateFinancialPreferences}>
      <div>
        <Label htmlFor="pref-horizon">Horizonte de obligaciones proximas (dias)</Label>
        <Input
          id="pref-horizon"
          name="default_obligation_horizon_days"
          type="number"
          min={1}
          max={90}
          defaultValue={profile.default_obligation_horizon_days}
          required
        />
      </div>
      <div className="flex items-center gap-[8px]">
        <Checkbox id="pref-pending" name="pending_affects_safe_to_spend" defaultChecked={profile.pending_affects_safe_to_spend} />
        <Label htmlFor="pref-pending" className="mb-0">
          Los gastos pendientes afectan el estimado de &quot;puedes gastar&quot;
        </Label>
      </div>
    </ActionForm>
  );
}
