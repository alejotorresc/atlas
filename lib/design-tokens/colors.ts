/**
 * ATLAS color tokens — the single source of truth for every color used in
 * the product. Never hardcode a hex value in a component; reference a
 * token (directly, or via the CSS custom properties in app/globals.css,
 * which mirror this file at :root — the same variables power both the
 * application and /style-guide).
 *
 * This is the official ATLAS palette. Do not reinterpret it, and do not
 * introduce new brand colors — every color decision should be traceable
 * to one of the values below.
 *
 * Balance across a real screen: ~85% neutral, ~10% Brand Blue, ~5%
 * semantic. Brand Blue is the ONLY brand color, and it attracts attention
 * because it is rare — if a screen feels colorful, too much color is
 * being used.
 */

/** The exact official neutral scale — reference these names in documentation and design review. */
export const grey = {
  white: '#FFFFFF',
  grey1: '#F0F0F0',
  grey2: '#C8C8C8',
  grey3: '#A0A0A0',
  grey4: '#787878',
  grey5: '#505050',
  grey6: '#282828',
  black: '#000000',
} as const;

export const colors = {
  primary: {
    DEFAULT: '#4691F5', // Brand Blue — precision, technology, focus, interaction, clarity
    hover: '#2E7CE0',
    pressed: '#1F5FB8',
    subtle: '#EAF2FE',
    border: '#BFD9FB',
  },
  background: grey.white, // default page
  surface: grey.white, // cards remain white — grouping comes from spacing, not color
  surfaceSecondary: grey.grey1, // secondary surfaces: subtle panels, input backgrounds, hover fills
  success: {
    DEFAULT: '#AFD200', // successful actions, completed goals, positive balances, paid obligations — fills, progress, large elements
    subtle: '#F3F9DB',
    text: '#5C6B00', // darkened for legible text/icons on white or on the subtle tint — DEFAULT fails contrast as text
  },
  warning: {
    DEFAULT: '#F5DC00', // upcoming due dates, approaching limits, medium priority — fills, large elements
    subtle: '#FDF8D6',
    text: '#7A6600', // darkened for legible text/icons — DEFAULT is far too light to read as text
  },
  caution: {
    DEFAULT: '#FF9600', // immediate attention: budget almost exhausted, payment due tomorrow, unusual spending
    subtle: '#FFEDD1',
    text: '#B36B00', // darkened for legible text/icons on light backgrounds
  },
  danger: {
    DEFAULT: '#F02828', // overdue payments, failed operations, destructive actions, critical alerts — fills, large elements
    subtle: '#FCE0E0',
    text: '#C41E1E', // darkened for legible text on white/light backgrounds (DEFAULT is borderline on small text)
  },
  info: {
    DEFAULT: '#005FDC', // informational banners, educational messages, neutral notifications — distinct from Brand Blue
    subtle: '#E1EBFB',
    text: '#005FDC', // already dark enough to use directly as text
  },
  /**
   * 10-step neutral scale for finer UI granularity than the 6 official
   * greys alone provide. Steps 100/300/400/600/700/900 are the official
   * grey1–grey6 exactly; 50/200/500/800 are minimal interpolated bridge
   * values (never a reinterpretation of brand color, only finer steps
   * between the official neutrals) used for hover fills and secondary
   * text nuance.
   */
  neutral: {
    50: '#F7F7F7', // bridge: hover fill lighter than grey1
    100: grey.grey1,
    200: '#DCDCDC', // bridge: between grey1 and grey2
    300: grey.grey2,
    400: grey.grey3,
    500: '#8C8C8C', // bridge: between grey3 and grey4
    600: grey.grey4,
    700: grey.grey5,
    800: '#3C3C3C', // bridge: between grey5 and grey6
    900: grey.grey6,
  },
} as const;

/**
 * Usage rules — where a color may (and may not) be used.
 * Documented in prose so the /style-guide page and code reviews can both
 * reference the same rules.
 */
export const colorUsageRules = [
  {
    token: 'primary (Brand Blue — the only brand color)',
    allowed: [
      'Primary buttons, active navigation, selected elements',
      'Links, focus rings, progress indicators',
      'Interactive controls: sliders, the active state of a toggle',
      'Primary chart series',
    ],
    disallowed: [
      'Decorative backgrounds — never flood the interface with blue',
      'Body text color',
      'Success states — never use the brand color to mean "good," that is success\'s job',
      'More than one saturated color per screen',
    ],
  },
  {
    token: 'success / warning / caution / danger / info',
    allowed: [
      'success: successful actions, completed goals, positive balances, paid obligations, completed savings',
      'warning: upcoming due dates, approaching limits, medium-priority alerts',
      'caution: only when immediate attention is required — budget almost exhausted, payment due tomorrow, unusual spending',
      'danger: overdue payments, failed operations, destructive actions, critical alerts',
      'info: informational banners, educational messages, neutral notifications',
    ],
    disallowed: [
      'Decorative use — these colors carry meaning and must stay reserved for it (this is the 5% of a screen, not 20%)',
      'Coloring every KPI a different semantic color to "differentiate" them — that is not what these colors are for',
      'Two of them adjacent at full saturation on a large surface (pick one focal status per view)',
    ],
  },
  {
    token: 'neutral scale (the 85%)',
    allowed: [
      'grey6/900: primary text on light surfaces',
      'grey5/700: secondary text',
      'grey4/600: tertiary text, default icon color',
      'grey3/400: disabled state, placeholder text',
      'grey2/300: dividers, resting borders — subtle enough to almost disappear',
      'grey1/100: secondary surfaces (subtle panels, input backgrounds, hover fills)',
      'white: the default page and card surface',
    ],
    disallowed: [
      'black as a text color for large paragraphs — use grey6 instead, reserve true black very sparingly',
      'grey1 as body text on a white surface (fails contrast)',
      'Visible rectangular borders around every element — prefer whitespace and alignment to create grouping',
    ],
  },
] as const;
