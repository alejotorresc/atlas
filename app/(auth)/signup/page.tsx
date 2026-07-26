import Link from 'next/link';
import { SignupForm } from './signup-form';

export default function SignupPage() {
  return (
    <div>
      <h1 className="font-display mb-[16px] text-[20px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Crear cuenta</h1>
      <SignupForm />
      <div className="mt-4 text-sm text-[var(--ds-neutral-600)]">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="underline hover:text-[var(--ds-neutral-900)]">
          Inicia sesion
        </Link>
      </div>
    </div>
  );
}
