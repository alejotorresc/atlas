/**
 * Motion tokens. ATLAS motion is subtle, fast, and purposeful — it should
 * confirm that an action happened, never entertain. Nothing bounces.
 */

export const duration = {
  instant: 80, // micro feedback: checkbox check, button press
  fast: 140, // hover states, small UI transitions
  base: 200, // dialogs, sheets, dropdowns entering/leaving
  slow: 320, // page-level transitions
} as const;

export const easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)', // default — symmetric, calm
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)', // entrances: start fast, settle gently
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)', // exits: leave quickly, no lingering
} as const;

export const motionPresets = {
  pageTransition: { duration: duration.slow, easing: easing.standard, property: 'opacity, transform' },
  dialogEnter: { duration: duration.base, easing: easing.decelerate, property: 'opacity, transform' },
  dialogExit: { duration: duration.fast, easing: easing.accelerate, property: 'opacity, transform' },
  toastEnter: { duration: duration.base, easing: easing.decelerate, property: 'opacity, transform' },
  toastExit: { duration: duration.fast, easing: easing.accelerate, property: 'opacity' },
  hover: { duration: duration.fast, easing: easing.standard, property: 'background-color, border-color, color, box-shadow' },
  pressed: { duration: duration.instant, easing: easing.standard, property: 'transform, background-color' },
} as const;
