'use client';

import { useActionState } from 'react';
import { login, type ActionResult } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: ActionResult = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(async (_prev: ActionResult, formData: FormData) => {
    return (await login(formData)) ?? {};
  }, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Correo electronico</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Contrasena</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  );
}
