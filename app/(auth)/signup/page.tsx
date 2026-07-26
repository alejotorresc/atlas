import Link from 'next/link';
import { SignupForm } from './signup-form';

export default function SignupPage() {
  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Crear cuenta</h1>
      <SignupForm />
      <div className="mt-4 text-sm text-slate-600">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="underline hover:text-slate-900">
          Inicia sesion
        </Link>
      </div>
    </div>
  );
}
