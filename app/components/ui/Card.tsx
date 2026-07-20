import type { HTMLAttributes } from 'react';
import type { Tone } from './Button';

export default function Card({
  tone = 'party',
  tilt,
  elevated = false,
  className = '',
  style,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone; tilt?: number; elevated?: boolean }) {
  const bg = elevated ? 'bg-panel-elevated' : 'bg-panel';
  const tiltStyle = tone === 'party' && tilt ? { transform: `rotate(${tilt}deg)`, ...style } : style;
  return (
    <div
      className={`rounded-3xl border border-line ${bg} p-5 shadow-lg shadow-black/30 ${className}`.trim().replace(/\s+/g, ' ')}
      style={tiltStyle}
      {...props}
    >
      {children}
    </div>
  );
}
