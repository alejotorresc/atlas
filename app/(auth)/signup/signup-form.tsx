'use client';

import { useActionState } from 'react';
import { signup, type ActionResult } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: ActionResult = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(async (_prev: ActionResult, formData: FormData) => {
    return (await signup(formData)) ?? {};
  }, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
      </div>
      <div>
        <Label htmlFor="email">Correo electronico</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Contrasena</Label>
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
        {pending ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  );
}
