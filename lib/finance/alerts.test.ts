import { describe, expect, it } from 'vitest';
import { buildDeduplicationKey, deduplicateAlerts, obligationDueAlert } from './alerts';

describe('buildDeduplicationKey', () => {
  it('produces a stable, composable key', () => {
    expect(buildDeduplicationKey('obligation_due', 'obl-1', '2026-01-05')).toBe(
      'obligation_due:obl-1:2026-01-05',
    );
  });
});

describe('deduplicateAlerts', () => {
  it('drops candidates whose dedup key already exists', () => {
    const candidate = obligationDueAlert({
      obligationId: 'obl-1',
      name: 'Renta',
      dueDate: '2026-01-05',
      amountFormatted: 'Q3,500.00',
    });
    const result = deduplicateAlerts([candidate], new Set([candidate.deduplication_key]));
    expect(result).toEqual([]);
  });

  it('keeps candidates that are not yet present', () => {
    const candidate = obligationDueAlert({
      obligationId: 'obl-1',
      name: 'Renta',
      dueDate: '2026-01-05',
      amountFormatted: 'Q3,500.00',
    });
    const result = deduplicateAlerts([candidate], new Set());
    expect(result).toHaveLength(1);
  });

  it('never produces a new unread alert for the same obligation+due-date twice', () => {
    const first = obligationDueAlert({ obligationId: 'obl-1', name: 'Renta', dueDate: '2026-01-05', amountFormatted: 'Q1.00' });
    const second = obligationDueAlert({ obligationId: 'obl-1', name: 'Renta', dueDate: '2026-01-05', amountFormatted: 'Q1.00' });
    expect(first.deduplication_key).toBe(second.deduplication_key);
  });
});
