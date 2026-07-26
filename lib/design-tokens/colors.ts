/**
 * ATLAS color tokens — the single source of truth for every color used in
 * the product. Never hardcode a hex value in a component; reference a
 * token (directly, or via the CSS custom properties in app/globals.css,
 * which mirror this file at :root — the same variables power both the
 * application and /style-guide).
 *
 * Palette philosophy: the interface is mostly monochromatic. Approximate
 * balance across a real screen: 90% neutral, 8% the single brand color,
 * 2% semantic color. There is exactly ONE vibrant color in the product —
 * everything else is a warm-neutral scale plus the (already restrained)
 * semantic set. No gradients, no glassmorphism, no second accent hue.
 */

export const colors = {
  primary: {
    DEFAULT: '#2E5BFF', // the one vibrant brand color — precision, engineering, focus, clarity
    hover: '#2447D1',
    pressed: '#1B379E',
    subtle: '#EAEFFF', // tinted backgrounds behind primary content (badges, selected rows)
    border: '#C7D4FF',
  },
  background: '#FAF8F4', // Warm White — page canvas
  surface: '#FFFFFF', // White — cards, sheets, dialogs
  success: {
    DEFAULT: '#3F7D58',
    subtle: '#E7F1EA',
  },
  warning: {
    DEFAULT: '#B8862E',
    subtle: '#FBF1DE',
  },
  danger: {
    DEFAULT: '#B3483F',
    subtle: '#F7E9E7',
  },
  info: {
    DEFAULT: '#5B6472', // deliberately a muted slate, not another blue — the brand color owns "vibrant"
    subtle: '#EDEEF1',
  },
  neutral: {
    50: '#FAF9F7',
    100: '#F2F0EC',
    200: '#E6E3DC',
    300: '#D4D0C7',
    400: '#B3AEA1',
    500: '#8C8677',
    600: '#6B665A',
    700: '#504C43',
    800: '#38352E',
    900: '#211F1B',
  },
} as const;

/**
 * Usage rules — where a color may (and may not) be used.
 * Documented in prose so the /style-guide page and code reviews can both
 * reference the same rules.
 */
export const colorUsageRules = [
  {
    token: 'primary (the one brand color)',
    allowed: [
      'Primary buttons and their focus/hover states',
      'Active navigation item, selected states (selected account, selected date)',
      'Key numeric emphasis — at most one focal figure per screen (e.g. the safe-to-spend headline)',
      'Progress fills and chart emphasis where a single precise highlight is the point',
    ],
    disallowed: [
      'Large background fills — a full-color page reads as a banking app, not ATLAS',
      'Body text color',
      'Success states — never use the brand color to mean "good," that is success\'s job',
      'More than one saturated color per screen — if something else wants to be vibrant, make it neutral instead',
    ],
  },
  {
    token: 'success / warning / danger / info',
    allowed: [
      'Status badges, inline alerts, form validation messages',
      'Chart series that represent income/expense/neutral when a semantic meaning is needed',
    ],
    disallowed: [
      'Decorative use — these colors carry meaning and must stay reserved for it (this is the 2% of a screen, not 20%)',
      'Two of them adjacent at full saturation on a large surface (pick one focal status per view)',
      'info as a second brand-like accent — it is intentionally desaturated so the one brand color stays singular',
    ],
  },
  {
    token: 'neutral scale (the 90%)',
    allowed: [
      '900/800: primary text on light surfaces',
      '600/700: secondary text, captions, disabled labels',
      '400/500: borders on interactive elements, placeholder text',
      '200/300: dividers, resting borders, table row separators',
      '50/100: subtle section backgrounds, hover states on surfaces',
      'Nearly everything on nearly every screen — the neutral scale, not color, should be doing most of the work',
    ],
    disallowed: [
      'neutral.900 as a full-bleed background (use it for text only — it is warm-black, not a surface color)',
      'neutral.50 as body text on surface (fails contrast)',
    ],
  },
] as const;
