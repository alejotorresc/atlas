/**
 * Re-exports the design-system Button so every existing screen picks up
 * the ATLAS design system automatically. New code should import directly
 * from '@/components/design-system' — this file exists only so the many
 * existing call sites (`variant="primary" | "secondary" | "ghost" |
 * "danger"`) keep working unchanged.
 */
export { Button, type ButtonProps } from '@/components/design-system/Button';
