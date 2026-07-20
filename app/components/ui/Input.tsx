import type { InputHTMLAttributes } from 'react';
import type { Tone } from './Button';

export default function Input({
  tone = 'party',
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { tone?: Tone }) {
  void tone; // party/calm currently share the same input treatment via CSS variables
  return (
    <input
      className={`w-full px-4 py-3 rounded-2xl border border-line bg-panel text-fg placeholder:text-fg-muted focus:outline-none focus:border-neon-gold transition-colors ${className}`.trim().replace(/\s+/g, ' ')}
      {...props}
    />
  );
}
