export type Plan = 'free' | 'pro' | 'event_pass' | 'studio';

export interface PlanLimits {
  maxEvents: number;
  maxSongs: number;
  branding: boolean;
  export: boolean;
  maxSubAccounts: number;
  customDomain: boolean;
}

export interface UserPlanShape {
  plan: string;
  current_period_end?: Date | string | null;
  plan_status?: string | null;
}

export function getEffectivePlan(user: UserPlanShape): Plan {
  const raw = (user.plan ?? 'free') as Plan;

  if (raw === 'event_pass') {
    if (!user.current_period_end) return 'free';
    const end = new Date(user.current_period_end);
    if (end.getTime() < Date.now()) return 'free';
    return 'event_pass';
  }

  if (raw === 'pro' || raw === 'studio') {
    if (user.plan_status === 'canceled' || user.plan_status === 'unpaid') return 'free';
    if (user.current_period_end) {
      const end = new Date(user.current_period_end);
      const grace = 3 * 24 * 60 * 60 * 1000;
      if (end.getTime() + grace < Date.now() && user.plan_status !== 'active' && user.plan_status !== 'trialing') {
        return 'free';
      }
    }
    return raw;
  }

  return 'free';
}

export function getPlanLimits(plan: Plan): PlanLimits {
  switch (plan) {
    case 'studio':
      return {
        maxEvents: Infinity,
        maxSongs: Infinity,
        branding: true,
        export: true,
        maxSubAccounts: Infinity,
        customDomain: true,
      };
    case 'pro':
      return {
        maxEvents: Infinity,
        maxSongs: Infinity,
        branding: true,
        export: true,
        maxSubAccounts: 0,
        customDomain: false,
      };
    case 'event_pass':
      return {
        maxEvents: 1,
        maxSongs: Infinity,
        branding: true,
        export: true,
        maxSubAccounts: 0,
        customDomain: false,
      };
    default:
      return {
        maxEvents: 1,
        maxSongs: 30,
        branding: false,
        export: false,
        maxSubAccounts: 0,
        customDomain: false,
      };
  }
}

export const FREE_SONG_LIMIT = 30;
export const FREE_EVENT_LIMIT = 1;
