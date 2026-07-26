/**
 * Shadows are soft and diffuse — never a hard drop shadow. They exist to
 * communicate elevation, not to decorate. Values pair with elevation.ts.
 */

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(33 31 27 / 0.04)',
  sm: '0 2px 6px -1px rgb(33 31 27 / 0.06), 0 1px 2px -1px rgb(33 31 27 / 0.04)',
  md: '0 8px 16px -4px rgb(33 31 27 / 0.08), 0 2px 4px -2px rgb(33 31 27 / 0.04)',
  lg: '0 16px 32px -8px rgb(33 31 27 / 0.12), 0 4px 8px -4px rgb(33 31 27 / 0.06)',
  focusRing: '0 0 0 3px rgb(20 69 63 / 0.35)', // primary at low opacity, for focus-visible rings
} as const;
