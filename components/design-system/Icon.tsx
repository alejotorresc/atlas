import { forwardRef } from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { iconStrokeWidth } from '@/lib/design-tokens/icons';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<IconSize, number> = { xs: 16, sm: 18, md: 20, lg: 24, xl: 32 };

export interface IconProps extends Omit<LucideProps, 'size'> {
  icon: LucideIcon;
  size?: IconSize;
}

/**
 * Thin wrapper around lucide-react that enforces ATLAS's icon rules: one
 * fixed stroke width, and sizes constrained to the documented scale
 * (16/18/20/24/32) instead of arbitrary pixel values.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(({ icon: LucideIconComponent, size = 'md', strokeWidth, ...props }, ref) => {
  return <LucideIconComponent ref={ref} size={SIZE_MAP[size]} strokeWidth={strokeWidth ?? iconStrokeWidth} {...props} />;
});
Icon.displayName = 'Icon';
