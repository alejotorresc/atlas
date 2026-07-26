/**
 * Icon system. ATLAS uses exactly one icon family — mixing families is the
 * fastest way to make an interface feel unintentional. Never import from
 * any icon package other than `lucide-react` in application code.
 */

export const iconFamily = 'lucide-react' as const;

export const iconStrokeWidth = 1.75; // consistent optical weight across every icon

export const iconSizes = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const iconRules = [
  'Always outline style — Lucide is outline-only by default, never substitute a filled variant.',
  'Never mix in icons from another library, an emoji, or a custom SVG unless Lucide genuinely lacks the concept.',
  `Stroke width is fixed at ${iconStrokeWidth} everywhere — do not vary it per icon.`,
  'Give icons room to breathe: minimum 8px of padding between an icon and adjacent text/edges unless explicitly building a dense table.',
  'Icons are functional, not decorative — every icon either labels an action/entity or is marked aria-hidden if purely reinforcing adjacent text.',
] as const;

/**
 * Canonical icon-to-concept mapping so the same concept always uses the
 * same glyph across the product.
 */
export const iconMap = {
  accounts: 'Wallet',
  creditCards: 'CreditCard',
  budgets: 'PieChart',
  savings: 'PiggyBank',
  calendar: 'Calendar',
  transactions: 'ArrowLeftRight',
  income: 'ArrowDownLeft',
  expense: 'ArrowUpRight',
  transfer: 'Repeat',
  alerts: 'Bell',
  settings: 'Settings',
  reports: 'BarChart3',
  search: 'Search',
  filter: 'SlidersHorizontal',
  notification: 'Bell',
  profile: 'CircleUser',
} as const;

export type IconConcept = keyof typeof iconMap;
