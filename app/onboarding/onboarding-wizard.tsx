'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  completeOnboarding,
  createOnboardingAccount,
  createOnboardingCard,
  createOnboardingIncome,
  saveOnboardingProfile,
} from '@/features/onboarding/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

const STEPS = ['Perfil', 'Cuenta', 'Tarjeta', 'Ingreso', 'Listo'] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runStep(action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>, formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStep((s) => s + 1);
    });
  }

  function skip() {
    setError(null);
    setStep((s) => s + 1);
  }

  function finish() {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push('/');
    });
  }

  return (
    <div>
      <ol className="mb-6 flex gap-2 text-xs text-[var(--ds-neutral-500)]" aria-label="Progreso">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? 'font-semibold text-[var(--ds-neutral-900)]' : ''}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="mb-4 text-sm text-[var(--ds-color-danger)]">
          {error}
        </p>
      )}

      {step === 0 && (
        <form
          action={(fd) => runStep(saveOnboardingProfile, fd)}
          className="space-y-4"
        >
          <h2 className="text-base font-semibold">Tu perfil</h2>
          <div>
            <Label htmlFor="display_name">Nombre para mostrar</Label>
            <Input id="display_name" name="display_name" required />
          </div>
          <div>
            <Label htmlFor="primary_currency">Moneda principal</Label>
            <Input id="primary_currency" name="primary_currency" defaultValue="GTQ" />
          </div>
          <div>
            <Label htmlFor="locale">Idioma / region</Label>
            <Input id="locale" name="locale" defaultValue="es-GT" />
          </div>
          <div>
            <Label htmlFor="timezone">Zona horaria</Label>
            <Input id="timezone" name="timezone" defaultValue="America/Guatemala" />
          </div>
          <Button type="submit" disabled={pending}>
            Continuar
          </Button>
        </form>
      )}

      {step === 1 && (
        <form action={(fd) => runStep(createOnboardingAccount, fd)} className="space-y-4">
          <h2 className="text-base font-semibold">Tu primera cuenta</h2>
          <div>
            <Label htmlFor="name">Nombre de la cuenta</Label>
            <Input id="name" name="name" required placeholder="Cuenta monetaria" />
          </div>
          <div>
            <Label htmlFor="account_type">Tipo</Label>
            <Select id="account_type" name="account_type" defaultValue="checking">
              <option value="checking">Monetaria</option>
              <option value="savings">Ahorro</option>
              <option value="cash">Efectivo</option>
              <option value="digital_wallet">Billetera digital</option>
              <option value="investment">Inversion</option>
              <option value="other">Otro</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="opening_balance">Saldo inicial</Label>
            <Input id="opening_balance" name="opening_balance" defaultValue="0.00" required />
          </div>
          <div className="flex items-center gap-2">
            <input id="include_in_available_balance" name="include_in_available_balance" type="checkbox" defaultChecked />
            <Label htmlFor="include_in_available_balance" className="mb-0">
              Incluir en saldo disponible
            </Label>
          </div>
          <Button type="submit" disabled={pending}>
            Continuar
          </Button>
        </form>
      )}

      {step === 2 && (
        <form action={(fd) => runStep(createOnboardingCard, fd)} className="space-y-4">
          <h2 className="text-base font-semibold">Tu primera tarjeta (opcional)</h2>
          <div>
            <Label htmlFor="card_name">Nombre de la tarjeta</Label>
            <Input id="card_name" name="name" placeholder="Visa Clasica" />
          </div>
          <div>
            <Label htmlFor="institution_name">Institucion</Label>
            <Input id="institution_name" name="institution_name" />
          </div>
          <div>
            <Label htmlFor="last_four">Ultimos 4 digitos</Label>
            <Input id="last_four" name="last_four" maxLength={4} />
          </div>
          <div>
            <Label htmlFor="credit_limit">Limite de credito</Label>
            <Input id="credit_limit" name="credit_limit" defaultValue="0.00" />
          </div>
          <div>
            <Label htmlFor="current_balance">Saldo actual</Label>
            <Input id="current_balance" name="current_balance" defaultValue="0.00" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="statement_day">Dia de corte</Label>
              <Input id="statement_day" name="statement_day" type="number" min={1} max={31} defaultValue={1} />
            </div>
            <div>
              <Label htmlFor="payment_due_day">Dia de pago</Label>
              <Input id="payment_due_day" name="payment_due_day" type="number" min={1} max={31} defaultValue={15} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              Continuar
            </Button>
            <Button type="button" variant="secondary" onClick={skip} disabled={pending}>
              Omitir
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form action={(fd) => runStep(createOnboardingIncome, fd)} className="space-y-4">
          <h2 className="text-base font-semibold">Ingreso recurrente (opcional)</h2>
          <div>
            <Label htmlFor="description">Descripcion</Label>
            <Input id="description" name="description" placeholder="Salario" />
          </div>
          <div>
            <Label htmlFor="amount">Monto</Label>
            <Input id="amount" name="amount" placeholder="5000.00" />
          </div>
          <div>
            <Label htmlFor="next_due_date">Proxima fecha esperada</Label>
            <Input id="next_due_date" name="next_due_date" type="date" />
          </div>
          <div>
            <Label htmlFor="frequency">Frecuencia</Label>
            <Select id="frequency" name="frequency" defaultValue="monthly">
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quincenal</option>
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              Continuar
            </Button>
            <Button type="button" variant="secondary" onClick={skip} disabled={pending}>
              Omitir
            </Button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold">Todo listo</h2>
          <p className="text-sm text-[var(--ds-neutral-600)]">
            Creamos categorias en espanol por defecto y guardamos tu informacion inicial. Puedes ajustar todo despues
            desde Configuracion.
          </p>
          <Button onClick={finish} disabled={pending}>
            {pending ? 'Finalizando...' : 'Ir al panel principal'}
          </Button>
        </div>
      )}
    </div>
  );
}
