import { describe, it, expect } from 'vitest';
import { getEffectivePlan, getPlanLimits } from './plans';

describe('getEffectivePlan', () => {
  it('returns free for users without a plan', () => {
    expect(getEffectivePlan({ plan: 'free' })).toBe('free');
    expect(getEffectivePlan({ plan: '' })).toBe('free');
  });

  it('returns event_pass when current_period_end is in the future', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(getEffectivePlan({ plan: 'event_pass', current_period_end: future })).toBe('event_pass');
  });

  it('falls back to free when event_pass period_end is missing', () => {
    expect(getEffectivePlan({ plan: 'event_pass' })).toBe('free');
    expect(getEffectivePlan({ plan: 'event_pass', current_period_end: null })).toBe('free');
  });

  it('falls back to free when event_pass period_end is in the past', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    expect(getEffectivePlan({ plan: 'event_pass', current_period_end: past })).toBe('free');
  });

  it('returns pro when plan is pro and not canceled', () => {
    expect(getEffectivePlan({ plan: 'pro', plan_status: 'active' })).toBe('pro');
  });

  it('returns free when pro is canceled', () => {
    expect(getEffectivePlan({ plan: 'pro', plan_status: 'canceled' })).toBe('free');
    expect(getEffectivePlan({ plan: 'pro', plan_status: 'unpaid' })).toBe('free');
  });

  it('allows grace period for pro after period_end', () => {
    const recentPast = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    expect(
      getEffectivePlan({ plan: 'pro', plan_status: 'active', current_period_end: recentPast })
    ).toBe('pro');
  });

  it('expires pro after 3-day grace period if not active', () => {
    const longPast = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(
      getEffectivePlan({ plan: 'pro', plan_status: 'past_due', current_period_end: longPast })
    ).toBe('free');
  });

  it('returns studio for active studio plan', () => {
    expect(getEffectivePlan({ plan: 'studio', plan_status: 'active' })).toBe('studio');
  });

  it('downgrades canceled studio to free', () => {
    expect(getEffectivePlan({ plan: 'studio', plan_status: 'canceled' })).toBe('free');
  });
});

describe('getPlanLimits', () => {
  it('free has minimal limits', () => {
    const limits = getPlanLimits('free');
    expect(limits.maxEvents).toBe(1);
    expect(limits.maxSongs).toBe(30);
    expect(limits.branding).toBe(false);
    expect(limits.export).toBe(false);
    expect(limits.maxSubAccounts).toBe(0);
    expect(limits.customDomain).toBe(false);
  });

  it('event_pass allows one full event with branding', () => {
    const limits = getPlanLimits('event_pass');
    expect(limits.maxEvents).toBe(1);
    expect(limits.maxSongs).toBe(Infinity);
    expect(limits.branding).toBe(true);
    expect(limits.export).toBe(true);
    expect(limits.maxSubAccounts).toBe(0);
    expect(limits.customDomain).toBe(false);
  });

  it('pro has unlimited events without sub-accounts', () => {
    const limits = getPlanLimits('pro');
    expect(limits.maxEvents).toBe(Infinity);
    expect(limits.maxSongs).toBe(Infinity);
    expect(limits.branding).toBe(true);
    expect(limits.export).toBe(true);
    expect(limits.maxSubAccounts).toBe(0);
    expect(limits.customDomain).toBe(false);
  });

  it('studio has full whitelabel capabilities', () => {
    const limits = getPlanLimits('studio');
    expect(limits.maxEvents).toBe(Infinity);
    expect(limits.maxSongs).toBe(Infinity);
    expect(limits.branding).toBe(true);
    expect(limits.export).toBe(true);
    expect(limits.maxSubAccounts).toBe(Infinity);
    expect(limits.customDomain).toBe(true);
  });
});
