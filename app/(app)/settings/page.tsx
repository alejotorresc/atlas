import { getCurrentUser } from '@/lib/supabase/server';
import { getProfile } from '@/features/profile/queries';
import { listOwnedCategories } from '@/features/categories/queries';
import { Card } from '@/components/ui/card';
import { ProfileForm } from './profile-form';
import { PreferencesForm } from './preferences-form';
import { CategoryManager } from './category-manager';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile, categories] = await Promise.all([getProfile(), listOwnedCategories(user.id)]);
  if (!profile) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Configuracion</h1>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-500">Perfil</h2>
        <Card>
          <ProfileForm profile={profile} />
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-500">Categorias</h2>
        <CategoryManager categories={categories} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-500">Preferencias financieras</h2>
        <Card>
          <PreferencesForm profile={profile} />
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-500">Datos</h2>
        <Card className="space-y-3">
          <div>
            <p className="text-sm font-medium">Exportar movimientos</p>
            <p className="text-sm text-slate-600">Descarga todos tus movimientos en formato CSV.</p>
            <a href="/api/export" className="mt-2 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Exportar CSV
            </a>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-sm font-medium">Propiedad de tus datos</p>
            <p className="text-sm text-slate-600">
              Toda tu informacion financiera pertenece unicamente a tu cuenta y esta protegida mediante Row Level
              Security en la base de datos: ningun otro usuario puede leerla o modificarla.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-sm font-medium">Eliminacion de cuenta</p>
            <p className="text-sm text-slate-600">
              La eliminacion completa y segura de la cuenta (incluyendo todos los registros asociados) no esta
              implementada en este MVP para evitar un flujo incompleto o inseguro. Si necesitas eliminar tu cuenta,
              contacta al administrador del proyecto para hacerlo manualmente desde la base de datos de Supabase.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
