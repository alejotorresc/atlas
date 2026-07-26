export const UTILIZATION_THRESHOLDS = [30, 50, 75, 90] as const;

/** Credit utilization percentage. Zero-limit cards safely return 0 instead of dividing by zero. */
export function creditUtilization(currentBalanceMinor: number, creditLimitMinor: number): number {
  if (creditLimitMinor <= 0) return 0;
  return (currentBalanceMinor / creditLimitMinor) * 100;
}

/** Highest utilization threshold (30/50/75/90) currently met or exceeded, or null. */
export function highestUtilizationThresholdReached(utilizationPercent: number): number | null {
  const reached = UTILIZATION_THRESHOLDS.filter((t) => utilizationPercent >= t);
  return reached.length > 0 ? Math.max(...reached) : null;
}
