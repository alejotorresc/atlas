/**
 * 8-point spacing system (with a 4px half-step for tight contexts like
 * icon-to-label gaps). All layout spacing in ATLAS should map to one of
 * these values — no arbitrary pixel values in component code.
 */

export const spacing = {
  '4': 4,
  '8': 8,
  '12': 12,
  '16': 16,
  '24': 24,
  '32': 32,
  '40': 40,
  '48': 48,
  '64': 64,
} as const;

export type SpacingToken = keyof typeof spacing;

export const spacingUsage = [
  { token: '4', use: 'Icon-to-label gap, tight inline groups' },
  { token: '8', use: 'Gap between related small elements (badge + label, stacked micro-text)' },
  { token: '12', use: 'Form field internal padding (vertical), gap between form label and input' },
  { token: '16', use: 'Default card padding, gap between form fields, list item padding' },
  { token: '24', use: 'Gap between cards in a grid, section internal padding on mobile' },
  { token: '32', use: 'Gap between distinct sections, section internal padding on desktop' },
  { token: '40', use: 'Page top padding on mobile' },
  { token: '48', use: 'Gap between major page regions on desktop' },
  { token: '64', use: 'Page top/bottom padding on desktop, hero-level spacing' },
] as const;
