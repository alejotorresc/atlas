/**
 * Border radius scale. Corners are subtle enough to soften an edge and
 * never enough to become a visual element — the user should barely
 * notice the radius. Avoid "bubble UI"; ATLAS is precise, not playful.
 */

export const radius = {
  sm: 4, // small controls: checkboxes, chips, inline badges
  md: 6, // buttons, inputs
  lg: 8, // standard cards, popovers, dialogs
  xl: 10, // rarely used — a slightly larger surface than a standard card
  '2xl': 14, // bottom sheets (top corners only)
  pill: 9999, // segmented controls, pill badges, the FAB
} as const;

export const radiusUsage = [
  { token: 'sm (4px)', use: 'Checkboxes, small chips, table row hover highlight' },
  { token: 'md (6px)', use: 'Buttons, text inputs, selects' },
  { token: 'lg (8px)', use: 'Standard cards, dropdown menus, popovers, dialogs' },
  { token: 'xl (10px)', use: 'A rarely-needed larger surface than a standard card' },
  { token: '2xl (14px)', use: 'Bottom sheets — top-left and top-right corners only' },
  { token: 'pill (9999px)', use: 'Segmented controls, status pills, the floating action button' },
] as const;
