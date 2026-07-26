/**
 * Typography system built on GT Pressura Extended, the official ATLAS
 * typeface (self-hosted, see app/globals.css @font-face declarations).
 * Four weights are loaded: Light (300), Regular (400), Medium (500),
 * Bold (700). Black exists in the source family but is intentionally not
 * loaded — reserve it for exceptional, rare display moments if one ever
 * arises, and load it on demand rather than by default.
 *
 * No italic in the UI — the italic cut is not loaded. Hierarchy comes
 * primarily from size, weight, and spacing, not from reaching for Bold or
 * slanting text — large numbers in particular should read as elegant, not
 * shouted.
 *
 * GT Pressura Extended covers ~95% of the interface: headings, navigation,
 * buttons, forms, cards, dashboards, financial values, body text, dialogs,
 * onboarding, reports. GT Pressura Mono is a separate, deliberately rare
 * (~5%) editorial accent — see monoUsageRules below and fontFamily.mono.
 */

export const fontFamily = {
  sans: '"GT Pressura Extended", Arial, Helvetica, sans-serif',
  mono: '"GT Pressura Mono", ui-monospace, monospace',
} as const;

export const monoUsageRules = {
  principle:
    'GT Pressura Extended defines the product; GT Pressura Mono adds craftsmanship. Mono should feel like a carefully placed editorial detail, never a second interface font. When in doubt, use Extended.',
  allowed: [
    'Transaction IDs (#TX-000123)',
    'Masked account numbers',
    'Timestamps ("Actualizado hace 2 horas", "Ultima sincronizacion")',
    'Database/technical identifiers',
    'Version numbers (v1.2.0)',
    'Technical metadata, keyboard shortcuts',
    'Small data labels, tiny UI annotations',
    'Developer/debug-mode information',
    'Subtle section metadata ("Creado jul 2026")',
    'Chart values, when a tabular/technical feel is appropriate',
    'Currency codes as a small annotation (GTQ)',
  ],
  prohibited: [
    'Page titles, dashboard headings',
    'Navigation',
    'Body text, paragraphs, onboarding copy, long descriptions',
    'Buttons',
    'Large financial values (the numericDisplay tier is always Extended)',
    'Cards and empty states',
  ],
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
} as const;

export interface TypeStyle {
  fontSize: number; // px
  lineHeight: number; // px
  weight: keyof typeof fontWeight;
  letterSpacing?: string;
}

/**
 * The full type scale. Each tier documents its intended purpose so
 * component authors reach for the right one instead of eyeballing a size.
 * Weight is used intentionally: Light for the rare, large editorial
 * display moment; Regular for everything read at length; Medium for
 * anything that needs quiet emphasis (titles, numbers, buttons); Bold is
 * reserved and not part of the default scale at all.
 */
export const typeScale: Record<string, TypeStyle & { purpose: string }> = {
  display: {
    fontSize: 40,
    lineHeight: 46,
    weight: 'light',
    letterSpacing: '-0.01em',
    purpose: 'One per screen, at most. A rare, large editorial statement — not the numeric hero (see numericDisplay).',
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
    weight: 'medium',
    letterSpacing: '-0.01em',
    purpose: 'Page titles.',
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    weight: 'medium',
    purpose: 'Section headings, card titles, dialog titles.',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    weight: 'regular',
    purpose: 'Default paragraph and UI text.',
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    weight: 'regular',
    purpose: 'Secondary text: helper text, metadata, table cells.',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    weight: 'regular',
    letterSpacing: '0.01em',
    purpose: 'Timestamps, fine print, chart axis labels.',
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
    weight: 'medium',
    letterSpacing: '0.02em',
    purpose: 'Form field labels, table column headers (often uppercase via text-transform, not a separate token).',
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    weight: 'medium',
    purpose: 'Button and interactive-control text.',
  },
  numericDisplay: {
    fontSize: 34,
    lineHeight: 40,
    weight: 'medium',
    letterSpacing: '-0.02em',
    purpose: 'Large monetary figures — safe-to-spend, account balances on their detail page. The primary visual element of the product. Uses tabular figures so digits do not jiggle as values update. Currency is always lower-emphasis than the amount (see NumericDisplay).',
  },
  numericBody: {
    fontSize: 15,
    lineHeight: 22,
    weight: 'medium',
    purpose: 'Inline monetary figures in lists and tables — medium weight (not bold) keeps a page of numbers calm.',
  },
} as const;

export type TypeScaleKey = keyof typeof typeScale;
