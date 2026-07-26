import type { AccountType } from '@/types/database';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Monetaria',
  savings: 'Ahorro',
  cash: 'Efectivo',
  digital_wallet: 'Billetera digital',
  investment: 'Inversion',
  other: 'Otro',
};

export const ACCOUNT_TYPE_OPTIONS = (Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]).map(([value, label]) => ({
  value,
  label,
}));
