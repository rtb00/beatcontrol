import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type Tone = 'party' | 'calm';
export type ButtonSize = 'sm' | 'md' | 'lg';

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const VARIANTS: Record<Tone, Record<ButtonVariant, string>> = {
  party: {
    primary: 'bg-gradient-to-r from-red to-neon-gold text-white glow-red hover:brightness-110',
    secondary: 'bg-panel-elevated text-fg border border-line hover:border-neon-gold',
    ghost: 'bg-transparent text-fg border border-line hover:bg-panel',
    danger: 'bg-danger text-white hover:brightness-110',
  },
  calm: {
    primary: 'bg-red text-white hover:brightness-110',
    secondary: 'bg-panel-elevated text-fg border border-line hover:border-neon-gold',
    ghost: 'bg-transparent text-fg border border-line hover:bg-panel',
    danger: 'bg-danger text-white hover:brightness-110',
  },
};

function cx(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Returns the class string for a button-styled element without rendering one —
 * use this on `next/link` CTAs, which can't be a `<button>`.
 */
export function buttonVariants({
  variant = 'primary',
  tone = 'party',
  size = 'md',
  tilt = false,
  className = '',
}: {
  variant?: ButtonVariant;
  tone?: Tone;
  size?: ButtonSize;
  tilt?: boolean;
  className?: string;
} = {}): string {
  const shape = tone === 'party'
    ? 'rounded-full font-display font-bold uppercase tracking-wide'
    : 'rounded-xl font-sans font-semibold';
  const tiltClass = tone === 'party' && tilt ? '-rotate-1 hover:rotate-0' : '';
  return cx(
    'inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
    shape,
    SIZES[size],
    VARIANTS[tone][variant],
    tiltClass,
    className
  );
}

export default function Button({
  variant = 'primary',
  tone = 'party',
  size = 'md',
  tilt = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  tone?: Tone;
  size?: ButtonSize;
  tilt?: boolean;
}) {
  return <button className={buttonVariants({ variant, tone, size, tilt, className })} {...props} />;
}
