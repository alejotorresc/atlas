import Link from 'next/link';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Iniciar sesion</h1>
      <LoginForm />
      <div className="mt-4 flex flex-col gap-1 text-sm text-slate-600">
        <Link href="/forgot-password" className="underline hover:text-slate-900">
          Olvidaste tu contrasena?
        </Link>
        <span>
          No tienes cuenta?{' '}
          <Link href="/signup" className="underline hover:text-slate-900">
            Registrate
          </Link>
        </span>
      </div>
    </div>
  );
}
