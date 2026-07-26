import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase/server';
import { listAlerts } from '@/features/alerts/queries';
import { formatDateGT } from '@/lib/dates/format';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Alertas</h1>
        <div className="flex gap-2">
          <RefreshAlertsButton />
          <MarkAllReadButton />
        </div>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <select name="severity" defaultValue={severity ?? ''} className="rounded-md border border-[var(--ds-neutral-300)] px-2 py-1.5 text-sm">
          <option value="">Todas las severidades</option>
          <option value="info">Info</option>
          <option value="warning">Advertencia</option>
          <option value="urgent">Urgente</option>
        </select>
        <button type="submit" className="rounded-md border border-[var(--ds-neutral-300)] px-3 py-1.5 text-sm">
          Filtrar
        </button>
      </form>

      {alerts.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--ds-neutral-600)]">No hay alertas para mostrar.</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => {
            const href = relatedHref(a.related_entity_type, a.related_entity_id);
            return (
              <li key={a.id}>
                <Card className={a.read_at ? 'opacity-70' : ''}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{a.title}</p>
                        <Badge tone={SEVERITY_TONE[a.severity]}>{a.severity}</Badge>
                        {!a.read_at && <Badge tone="info">No leida</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-[var(--ds-neutral-600)]">{a.message}</p>
                      <p className="mt-1 text-xs text-[var(--ds-neutral-400)]">{formatDateGT(a.effective_date)}</p>
                      {href && (
                        <Link href={href} className="mt-1 inline-block text-xs text-[var(--ds-neutral-600)] underline">
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
