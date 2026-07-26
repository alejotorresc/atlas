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
    <div className="space-y-[40px]">
      <h1 className="text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Configuracion</h1>

      <section id="perfil">
        <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">PERFIL</h2>
        <Card>
          <ProfileForm profile={profile} />
        </Card>
      </section>

      <section>
        <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">CATEGORIAS</h2>
        <CategoryManager categories={categories} />
      </section>

      <section>
        <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">PREFERENCIAS FINANCIERAS</h2>
        <Card>
          <PreferencesForm profile={profile} />
        </Card>
      </section>

      <section>
        <h2 className="mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">DATOS</h2>
        <Card className="space-y-[12px]">
          <div>
            <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">Exportar movimientos</p>
            <p className="text-[13px] text-[var(--ds-neutral-600)]">Descarga todos tus movimientos en formato CSV.</p>
            <a
              href="/api/export"
              className="mt-[8px] inline-block rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-[16px] py-[8px] text-[13px] font-medium text-white"
            >
              Exportar CSV
            </a>
          </div>
          <div className="border-t border-[var(--ds-neutral-100)] pt-[12px]">
            <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">Propiedad de tus datos</p>
            <p className="text-[13px] text-[var(--ds-neutral-600)]">
              Toda tu informacion financiera pertenece unicamente a tu cuenta y esta protegida mediante Row Level
              Security en la base de datos: ningun otro usuario puede leerla o modificarla.
            </p>
          </div>
          <div className="border-t border-[var(--ds-neutral-100)] pt-[12px]">
            <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">Eliminacion de cuenta</p>
            <p className="text-[13px] text-[var(--ds-neutral-600)]">
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
