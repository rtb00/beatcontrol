import type { ReactNode } from 'react';

/**
 * Wrap the root container of Legal/Auth/Account pages with this. It overrides
 * the design-system CSS variables in place (see `.tone-calm` in globals.css)
 * so `ui/*` components render their dampened treatment automatically, without
 * every call site needing an explicit `tone="calm"` prop.
 */
export default function CalmScope({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`tone-calm ${className}`.trim()}>{children}</div>;
}
