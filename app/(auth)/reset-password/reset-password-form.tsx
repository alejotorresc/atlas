'use client';

import { useActionState, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { resetPassword, type ActionResult } from '../actions';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: ActionResult = {};

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [sessionReady, setSessionReady] = useState<'checking' | 'ready' | 'invalid'>('checking');
  const [state, formAction, pending] = useActionState(async (_prev: ActionResult, formData: FormData) => {
    return (await resetPassword(formData)) ?? {};
  }, initialState);

  useEffect(() => {
    const code = searchParams.get('code');
    const supabase = createClient();

    async function ensureSession() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        setSessionReady(error ? 'invalid' : 'ready');
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSessionReady(session ? 'ready' : 'invalid');
    }

    ensureSession();
  }, [searchParams]);

  if (sessionReady === 'checking') {
    return <p className="text-sm text-[var(--ds-neutral-500)]">Verificando enlace...</p>;
  }

  if (sessionReady === 'invalid') {
    return <p role="alert" className="text-sm text-[var(--ds-color-danger)]">Este enlace de recuperacion no es valido o ya expiro.</p>;
  }

  if (state.success) {
    return <p role="status" className="text-sm text-[var(--ds-color-success)]">Tu contrasena fue actualizada. Ya puedes iniciar sesion.</p>;
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="password">Nueva contrasena</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-[var(--ds-color-danger)]">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Guardando...' : 'Guardar nueva contrasena'}
      </Button>
    </form>
  );
}
