import { Suspense } from 'react';
import { ResetPasswordForm } from './reset-password-form';

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Restablecer contrasena</h1>
      <Suspense fallback={<p className="text-sm text-slate-500">Cargando...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
