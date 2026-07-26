import Link from 'next/link';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display mb-[16px] text-[20px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Iniciar sesion</h1>
      <LoginForm />
      <div className="mt-4 flex flex-col gap-1 text-sm text-[var(--ds-neutral-600)]">
        <Link href="/forgot-password" className="underline hover:text-[var(--ds-neutral-900)]">
          Olvidaste tu contrasena?
        </Link>
        <span>
          No tienes cuenta?{' '}
          <Link href="/signup" className="underline hover:text-[var(--ds-neutral-900)]">
            Registrate
          </Link>
        </span>
      </div>
    </div>
  );
}
