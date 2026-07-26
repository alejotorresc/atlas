'use client';

import { useActionState } from 'react';
import { forgotPassword, type ActionResult } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: ActionResult = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(async (_prev: ActionResult, formData: FormData) => {
    return (await forgotPassword(formData)) ?? {};
  }, initialState);

  if (state.success) {
    return (
      <p role="status" className="text-sm text-slate-700">
        Si el correo existe, enviamos instrucciones para restablecer tu contrasena.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Correo electronico</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Enviando...' : 'Enviar instrucciones'}
      </Button>
    </form>
  );
}
