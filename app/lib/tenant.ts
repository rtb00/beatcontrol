import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { initDB, sql } from '@/app/lib/db';
import { extractSubdomain, type TenantBranding } from '@/app/lib/branding';

const DEFAULT_BRAND: TenantBranding = {
  userId: '',
  brandingName: 'BeatControl',
  brandingLogoUrl: null,
  subdomain: null,
};

// Cached per-subdomain for 60 seconds. Tenants change branding rarely;
// 60s is short enough for "feels live" updates after saving.
const loadTenantBySubdomain = unstable_cache(
  async (subdomain: string): Promise<TenantBranding | null> => {
    await initDB();
    const { rows } = await sql`
      SELECT id, branding_name, branding_logo_url, subdomain, plan, plan_status, current_period_end
      FROM users
      WHERE LOWER(subdomain) = ${subdomain}
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      userId: row.id as string,
      brandingName: (row.branding_name as string | null) ?? null,
      brandingLogoUrl: (row.branding_logo_url as string | null) ?? null,
      subdomain: row.subdomain as string,
    };
  },
  ['tenant-by-subdomain'],
  { revalidate: 60, tags: ['tenant'] }
);

// Server-Component helper. Reads Host header, extracts subdomain, loads
// tenant branding. Falls back to default BeatControl brand for apex/www/preview.
export async function getCurrentTenant(): Promise<TenantBranding> {
  const host = headers().get('host');
  const subdomain = extractSubdomain(host);
  if (!subdomain) return DEFAULT_BRAND;

  const tenant = await loadTenantBySubdomain(subdomain);
  if (!tenant) return DEFAULT_BRAND;

  return {
    ...tenant,
    brandingName: tenant.brandingName ?? DEFAULT_BRAND.brandingName,
  };
}

export { DEFAULT_BRAND };
