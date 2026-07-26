/**
 * ATLAS color tokens — the single source of truth for every color used in
 * the product. Never hardcode a hex value in a component; reference a
 * token (directly, or via the CSS custom properties in
 * app/style-guide/design-system.css which mirror this file).
 *
 * Palette intent: calm, warm-neutral, desaturated. No pure black, no pure
 * white, no saturated "app" colors. Financial data should never compete
 * visually with the numbers it represents.
 */

export const colors = {
  primary: {
    DEFAULT: '#14453F', // Deep Teal — primary actions, active nav, brand marks
    hover: '#0F3630',
    pressed: '#0B2924',
    subtle: '#E4EFEC', // tinted backgrounds behind primary content (badges, selected rows)
    border: '#BFD8D2',
  },
  secondary: {
    DEFAULT: '#8FC7C2', // Soft Aqua — secondary emphasis, chart series, illustrative accents
    hover: '#7DB8B2',
    subtle: '#EAF6F4',
  },
  accent: {
    DEFAULT: '#B8CB7E', // Lime — sparing use: positive highlights, small callouts, progress fills
    hover: '#A8BC6C',
    subtle: '#F2F5E7',
  },
  background: '#FAF8F4', // Warm White — page background
  surface: '#FFFDF9', // Surface — cards, sheets, dialogs (one step "up" from background)
  surfaceRaised: '#FFFFFF', // rare: the single most-elevated surface (e.g. a popover over a dialog)
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
    DEFAULT: '#3E6FA6',
    subtle: '#E8EFF6',
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
    token: 'primary',
    allowed: [
      'Primary buttons and their focus/hover states',
      'Active navigation item',
      'Selected states (selected account, selected date)',
      'Key numeric emphasis (e.g. the safe-to-spend headline figure)',
    ],
    disallowed: [
      'Large background fills (a full-teal page reads as a banking app, not ATLAS)',
      'Body text color',
      'Destructive actions — use danger instead',
    ],
  },
  {
    token: 'accent (Lime)',
    allowed: [
      'Small positive highlights: a budget under control, a goal on pace',
      'Progress bar fill on a light track',
      'Sparingly, as a single accent dot/badge — never as a large surface',
    ],
    disallowed: [
      'Buttons (too low-contrast for text, reads as a status color not an action color)',
      'Anything that needs to feel neutral or serious (never on danger/urgent content)',
    ],
  },
  {
    token: 'success / warning / danger / info',
    allowed: [
      'Status badges, inline alerts, form validation messages',
      'Chart series that represent income/expense/neutral when a semantic meaning is needed',
    ],
    disallowed: [
      'Decorative use — these four colors carry meaning and must stay reserved for it',
      'Two of them adjacent at full saturation on a large surface (pick one focal status per view)',
    ],
  },
  {
    token: 'neutral scale',
    allowed: [
      '900/800: primary text on light surfaces',
      '600/700: secondary text, captions, disabled labels',
      '400/500: borders on interactive elements, placeholder text',
      '200/300: dividers, resting borders, table row separators',
      '50/100: subtle section backgrounds, hover states on surfaces',
    ],
    disallowed: [
      'neutral.900 as a full-bleed background (use it for text only — it is warm-black, not a surface color)',
      'neutral.50 as body text on surface (fails contrast)',
    ],
  },
] as const;
