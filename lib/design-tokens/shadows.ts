/**
 * Shadows are almost invisible — they are not decoration, and ATLAS does
 * not use floating-card elevation as a visual style. Prefer whitespace
 * over elevation to separate content. A resting card typically has NO
 * shadow at all (see Card in components/design-system); these tokens
 * exist for the few moments elevation is genuinely load-bearing: a hover
 * state, a popover, a dialog.
 */

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(40 40 40 / 0.03)',
  sm: '0 2px 6px -2px rgb(40 40 40 / 0.05), 0 1px 2px -1px rgb(40 40 40 / 0.03)',
  md: '0 8px 16px -6px rgb(40 40 40 / 0.06), 0 2px 4px -2px rgb(40 40 40 / 0.03)',
  lg: '0 16px 32px -12px rgb(40 40 40 / 0.10), 0 4px 8px -4px rgb(40 40 40 / 0.04)',
  focusRing: '0 0 0 3px rgb(70 145 245 / 0.35)', // Brand Blue at low opacity, for focus-visible rings
} as const;
