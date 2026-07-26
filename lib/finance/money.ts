/**
 * All money is stored/transported as integer minor units (e.g. Q125.50 -> 12550).
 * Never use floating point arithmetic on persisted amounts.
 */

export function parseMoneyToMinorUnits(input: string | number): number {
  const normalized = typeof input === 'number' ? input.toString() : input.trim().replace(/,/g, '');
  if (normalized === '' || Number.isNaN(Number(normalized))) {
    throw new Error('Monto invalido');
  }
  const [wholePart = '0', fractionPartRaw = ''] = normalized.split('.');
  const sign = wholePart.startsWith('-') ? -1 : 1;
  const whole = Math.abs(parseInt(wholePart, 10));
  const fractionPart = (fractionPartRaw + '00').slice(0, 2);
  const fraction = parseInt(fractionPart, 10);
  return sign * (whole * 100 + fraction);
}

export function formatMinorUnits(minorUnits: number): string {
  const sign = minorUnits < 0 ? '-' : '';
  const abs = Math.abs(minorUnits);
  const whole = Math.floor(abs / 100);
  const fraction = abs % 100;
  return `${sign}${whole}.${fraction.toString().padStart(2, '0')}`;
}

export function formatCurrency(minorUnits: number, currency = 'GTQ', locale = 'es-GT'): string {
  const amount = minorUnits / 100;
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
