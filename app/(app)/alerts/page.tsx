import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { listAlerts } from '@/features/alerts/queries';
import { formatDateGT } from '@/lib/dates/format';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { AlertRowActions, MarkAllReadButton, RefreshAlertsButton } from './alert-actions';
import type { AlertSeverity } from '@/types/database';

const SEVERITY_TONE: Record<AlertSeverity, 'info' | 'warning' | 'danger'> = {
  info: 'info',
  warning: 'warning',
  urgent: 'danger',
};

function relatedHref(type: string | null, id: string | null): string | null {
  if (!type || !id) return null;
  switch (type) {
    case 'recurring_obligation':
      return '/obligations';
    case 'credit_card':
      return `/cards/${id}`;
    case 'budget':
      return '/budgets';
    case 'savings_goal':
      return `/savings/${id}`;
    default:
      return null;
  }
}

export default async function AlertsPage({ searchParams }: { searchParams: Promise<{ severity?: string; type?: string }> }) {
  const { severity, type } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const allAlerts = await listAlerts(user.id);
  const alerts = allAlerts.filter((a) => (severity ? a.severity === severity : true) && (type ? a.alert_type === type : true));
  const unreadCount = allAlerts.filter((a) => !a.read_at).length;

  return (
    <div className="space-y-[32px]">
      <section>
        <h1 className="font-display text-[28px] font-medium tracking-[-0.01em] text-[var(--ds-neutral-900)]">Notificaciones</h1>
        <p className="mt-[8px] text-[15px] text-[var(--ds-neutral-600)]">
          {unreadCount === 0 ? 'Estas al dia, no hay notificaciones sin leer.' : `Tienes ${unreadCount} ${unreadCount === 1 ? 'notificacion' : 'notificaciones'} sin leer.`}
        </p>
        <div className="mt-[20px] flex flex-wrap gap-[8px]">
          <RefreshAlertsButton />
          <MarkAllReadButton />
        </div>
      </section>

      <form method="get" className="flex flex-wrap items-center gap-[8px]">
        <Select
          name="severity"
          defaultValue={severity ?? ''}
          placeholder="Todas las severidades"
          className="w-auto min-w-[200px]"
          options={[
            { value: '', label: 'Todas las severidades' },
            { value: 'info', label: 'Info' },
            { value: 'warning', label: 'Advertencia' },
            { value: 'urgent', label: 'Urgente' },
          ]}
        />
        <button type="submit" className="rounded-[var(--ds-radius-md)] border border-[var(--ds-neutral-300)] px-[12px] py-[6px] text-[13px]">
          Filtrar
        </button>
      </form>

      {alerts.length === 0 ? (
        <Card>
          <p className="text-[15px] text-[var(--ds-neutral-600)]">No hay alertas para mostrar.</p>
        </Card>
      ) : (
        <ul className="space-y-[8px]">
          {alerts.map((a) => {
            const href = relatedHref(a.related_entity_type, a.related_entity_id);
            return (
              <li key={a.id}>
                <Card className={a.read_at ? 'opacity-70' : ''}>
                  <div className="flex items-start justify-between gap-[16px]">
                    <div>
                      <div className="flex items-center gap-[8px]">
                        <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{a.title}</p>
                        <Badge tone={SEVERITY_TONE[a.severity]}>{a.severity}</Badge>
                        {!a.read_at && <Badge tone="info">No leida</Badge>}
                      </div>
                      <p className="mt-[4px] text-[13px] text-[var(--ds-neutral-600)]">{a.message}</p>
                      <p className="mt-[4px] text-[12px] text-[var(--ds-neutral-400)]">{formatDateGT(a.effective_date)}</p>
                      {href && (
                        <Link href={href} className="mt-[4px] inline-block text-[12px] text-[var(--ds-neutral-600)] underline">
                          Ver detalle
                        </Link>
                      )}
                    </div>
                    <AlertRowActions alertId={a.id} isRead={!!a.read_at} />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
