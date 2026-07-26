/**
 * Border radius scale. ATLAS should feel "soft but architectural" — round
 * enough to feel calm and human, never so round it feels playful/gaming.
 */

export const radius = {
  sm: 8, // small controls: checkboxes, chips, inline badges
  md: 12, // buttons, inputs, small cards
  lg: 16, // standard cards, popovers
  xl: 20, // dialogs, large surfaces
  '2xl': 28, // bottom sheets (top corners only)
  pill: 9999, // segmented controls, pill badges, the FAB
} as const;

export const radiusUsage = [
  { token: 'sm (8px)', use: 'Checkboxes, small chips, table row hover highlight' },
  { token: 'md (12px)', use: 'Buttons, text inputs, selects, small metric cards' },
  { token: 'lg (16px)', use: 'Standard cards, dropdown menus, popovers' },
  { token: 'xl (20px)', use: 'Dialogs / modals' },
  { token: '2xl (28px)', use: 'Bottom sheets — top-left and top-right corners only' },
  { token: 'pill (9999px)', use: 'Segmented controls, status pills, the floating action button' },
] as const;
