import type { AlertSeverity, AlertType } from '@/types/database';

export interface AlertCandidate {
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  effective_date: string;
  deduplication_key: string;
}

/** Stable dedup key: {alert_type}:{entity_id}:{period_or_threshold}. */
export function buildDeduplicationKey(
  alertType: AlertType,
  entityId: string,
  periodOrThreshold: string | number,
): string {
  return `${alertType}:${entityId}:${periodOrThreshold}`;
}

export function obligationDueAlert(params: {
  obligationId: string;
  name: string;
  dueDate: string;
  amountFormatted: string;
}): AlertCandidate {
  return {
    alert_type: 'obligation_due',
    severity: 'warning',
    title: `Obligacion proxima: ${params.name}`,
    message: `${params.name} vence el ${params.dueDate} por ${params.amountFormatted}.`,
    related_entity_type: 'recurring_obligation',
    related_entity_id: params.obligationId,
    effective_date: params.dueDate,
    deduplication_key: buildDeduplicationKey('obligation_due', params.obligationId, params.dueDate),
  };
}

export function obligationOverdueAlert(params: {
  obligationId: string;
  name: string;
  dueDate: string;
}): AlertCandidate {
  return {
    alert_type: 'obligation_overdue',
    severity: 'urgent',
    title: `Obligacion vencida: ${params.name}`,
    message: `${params.name} no se ha pagado y vencio el ${params.dueDate}.`,
    related_entity_type: 'recurring_obligation',
    related_entity_id: params.obligationId,
    effective_date: params.dueDate,
    deduplication_key: buildDeduplicationKey('obligation_overdue', params.obligationId, params.dueDate),
  };
}

export function creditUtilizationAlert(params: {
  cardId: string;
  cardName: string;
  threshold: number;
  utilization: number;
  effectiveDate: string;
}): AlertCandidate {
  return {
    alert_type: 'credit_utilization',
    severity: params.threshold >= 75 ? 'urgent' : 'warning',
    title: `Utilizacion alta en ${params.cardName}`,
    message: `${params.cardName} alcanzo ${params.utilization.toFixed(0)}% de utilizacion.`,
    related_entity_type: 'credit_card',
    related_entity_id: params.cardId,
    effective_date: params.effectiveDate,
    deduplication_key: buildDeduplicationKey('credit_utilization', params.cardId, params.threshold),
  };
}

export function budgetAlert(params: {
  categoryId: string;
  categoryName: string;
  month: string;
  percentageUsed: number;
  exceeded: boolean;
}): AlertCandidate {
  return {
    alert_type: params.exceeded ? 'budget_exceeded' : 'budget_warning',
    severity: params.exceeded ? 'urgent' : 'warning',
    title: params.exceeded ? `Presupuesto excedido: ${params.categoryName}` : `Presupuesto cerca del limite: ${params.categoryName}`,
    message: `${params.categoryName} lleva ${params.percentageUsed.toFixed(0)}% del presupuesto de ${params.month}.`,
    related_entity_type: 'budget',
    related_entity_id: params.categoryId,
    effective_date: params.month,
    deduplication_key: buildDeduplicationKey(
      params.exceeded ? 'budget_exceeded' : 'budget_warning',
      params.categoryId,
      params.month,
    ),
  };
}

export function lowSafeToSpendAlert(params: { userId: string; effectiveDate: string }): AlertCandidate {
  return {
    alert_type: 'low_available_balance',
    severity: 'urgent',
    title: 'Saldo disponible negativo',
    message: 'Tu estimado de "puedes gastar" es negativo segun tus datos registrados.',
    related_entity_type: 'profile',
    related_entity_id: params.userId,
    effective_date: params.effectiveDate,
    deduplication_key: buildDeduplicationKey('low_available_balance', params.userId, params.effectiveDate),
  };
}

export function savingsGoalBehindAlert(params: { goalId: string; goalName: string; month: string }): AlertCandidate {
  return {
    alert_type: 'savings_goal_behind',
    severity: 'info',
    title: `Meta atrasada: ${params.goalName}`,
    message: `${params.goalName} va por debajo del ritmo necesario para llegar a la fecha objetivo.`,
    related_entity_type: 'savings_goal',
    related_entity_id: params.goalId,
    effective_date: params.month,
    deduplication_key: buildDeduplicationKey('savings_goal_behind', params.goalId, params.month),
  };
}

export function savingsGoalReachedAlert(params: { goalId: string; goalName: string; effectiveDate: string }): AlertCandidate {
  return {
    alert_type: 'savings_goal_reached',
    severity: 'info',
    title: `Meta alcanzada: ${params.goalName}`,
    message: `Felicidades, alcanzaste la meta "${params.goalName}".`,
    related_entity_type: 'savings_goal',
    related_entity_id: params.goalId,
    effective_date: params.effectiveDate,
    deduplication_key: buildDeduplicationKey('savings_goal_reached', params.goalId, 'reached'),
  };
}

/** Filters out candidates whose dedup key already exists as an active (non-dismissed) alert. */
export function deduplicateAlerts(candidates: AlertCandidate[], existingKeys: Set<string>): AlertCandidate[] {
  return candidates.filter((c) => !existingKeys.has(c.deduplication_key));
}
