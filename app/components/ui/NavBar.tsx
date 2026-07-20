import type { ReactNode } from 'react';
import type { Tone } from './Button';

/**
 * Structural nav shell only — each page composes its own logo/links/actions as
 * children. Deliberately not a monolithic "one navbar to rule them all"
 * component: every page's nav has different links/behaviour, and forcing
 * those through props risks silently dropping or altering content.
 */
export default function NavBar({
  tone = 'party',
  sticky = true,
  className = '',
  children,
}: {
  tone?: Tone;
  sticky?: boolean;
  className?: string;
  children: ReactNode;
}) {
  void tone;
  return (
    <nav
      className={`w-full border-b border-line bg-base/80 backdrop-blur ${sticky ? 'sticky top-0 z-40' : ''} ${className}`.trim().replace(/\s+/g, ' ')}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">{children}</div>
    </nav>
  );
}
