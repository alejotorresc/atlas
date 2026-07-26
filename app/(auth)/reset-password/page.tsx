import { Suspense } from 'react';
import { ResetPasswordForm } from './reset-password-form';

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="font-display mb-[16px] text-[20px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Restablecer contrasena</h1>
      <Suspense fallback={<p className="text-sm text-[var(--ds-neutral-500)]">Cargando...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
