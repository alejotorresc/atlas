import { shadows } from './shadows';

/**
 * Elevation levels tie a shadow + z-index together so "how high something
 * floats" is decided once, centrally, rather than per component.
 */

export const elevation = {
  0: { shadow: shadows.none, zIndex: 0 }, // page background, flat sections
  1: { shadow: shadows.xs, zIndex: 10 }, // resting cards
  2: { shadow: shadows.sm, zIndex: 20 }, // hovered/interactive cards, dropdown triggers
  3: { shadow: shadows.md, zIndex: 30 }, // popovers, menus, toasts
  4: { shadow: shadows.lg, zIndex: 40 }, // dialogs, bottom sheets
} as const;

export type ElevationLevel = keyof typeof elevation;
