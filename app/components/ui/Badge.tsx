import type { ReactNode } from 'react';
import type { Tone } from './Button';

export type BadgeColor = 'red' | 'gold' | 'turquoise' | 'success' | 'danger' | 'neutral';

const COLORS: Record<BadgeColor, string> = {
  red: 'bg-red/15 text-red border-red/40',
  gold: 'bg-neon-gold/15 text-neon-gold border-neon-gold/40',
  turquoise: 'bg-turquoise/15 text-turquoise border-turquoise/40',
  success: 'bg-success-bg text-success border-success/40',
  danger: 'bg-danger-bg text-danger border-danger/40',
  neutral: 'bg-panel-elevated text-fg-muted border-line',
};

export default function Badge({
  color = 'neutral',
  tone = 'party',
  className = '',
  children,
}: {
  color?: BadgeColor;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  const shape = tone === 'party'
    ? 'rounded-full font-display text-xs font-bold uppercase tracking-wide'
    : 'rounded-md font-sans text-xs font-semibold';
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-3 py-1 ${shape} ${COLORS[color]} ${className}`.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </span>
  );
}
