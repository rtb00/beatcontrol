'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { TenantBranding } from '@/app/lib/branding';

const BrandingContext = createContext<TenantBranding | null>(null);

export function BrandingProvider({
  value,
  children,
}: {
  value: TenantBranding;
  children: ReactNode;
}) {
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding(): TenantBranding {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    // Safe fallback for Client Components rendered outside the provider
    // (shouldn't happen once the layout is wired correctly).
    return {
      userId: '',
      brandingName: 'BeatControl',
      brandingLogoUrl: null,
      subdomain: null,
    };
  }
  return ctx;
}
