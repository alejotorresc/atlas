import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

/**
 * Button — the canonical action control for ATLAS. Every button-like
 * element in the product should render this component rather than a bare
 * <button>, so states (hover/pressed/disabled/loading) stay consistent.
 *
 * Sizing note: md/lg are 44px tall to meet the 44px minimum touch target
 * (see the Accessibility section of /style-guide).
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-[8px] font-medium whitespace-nowrap',
    'transition-[background-color,border-color,color,box-shadow,transform]',
    'duration-[var(--ds-duration-fast)] ease-[var(--ds-ease-standard)]',
    'active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:shadow-[var(--ds-shadow-focus)]',
    'disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-[var(--ds-color-primary)] text-white hover:bg-[var(--ds-color-primary-hover)] active:bg-[var(--ds-color-primary-pressed)]',
        secondary:
          'bg-[var(--ds-color-surface)] text-[var(--ds-neutral-900)] border border-[var(--ds-neutral-300)] hover:border-[var(--ds-neutral-400)] hover:bg-[var(--ds-neutral-50)]',
        ghost: 'bg-transparent text-[var(--ds-neutral-700)] hover:bg-[var(--ds-neutral-100)]',
        danger: 'bg-[var(--ds-color-danger)] text-white hover:opacity-90',
        icon: 'bg-transparent text-[var(--ds-neutral-700)] hover:bg-[var(--ds-neutral-100)] rounded-[var(--ds-radius-pill)]',
        fab: 'bg-[var(--ds-color-primary)] text-white shadow-[var(--ds-shadow-lg)] hover:bg-[var(--ds-color-primary-hover)] rounded-[var(--ds-radius-pill)]',
      },
      size: {
        sm: 'h-[32px] px-[12px] text-[13px] rounded-[var(--ds-radius-md)]',
        md: 'h-[44px] px-[16px] text-[15px] rounded-[var(--ds-radius-md)]',
        lg: 'h-[48px] px-[24px] text-[15px] rounded-[var(--ds-radius-md)]',
        iconSm: 'h-[32px] w-[32px]',
        iconMd: 'h-[44px] w-[44px]',
        fab: 'h-[56px] w-[56px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Icon icon={Loader2} size="sm" className="animate-spin" aria-hidden /> : children}
    </button>
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
