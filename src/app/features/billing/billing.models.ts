import { OnboardingPlan } from '../onboarding/onboarding.models';

/** A plan as the billing page shows it: the same shape as onboarding's plan cards. */
export type BillingPlan = OnboardingPlan;

/**
 * 'active'   = paid up.
 * 'pastDue'  = the renewal invoice isn't paid yet, but selling still works.
 * 'expired'  = not paid in time.
 * TODO(you): confirm the real states and grace period with the backend.
 */
export type SubscriptionStatus = 'active' | 'pastDue' | 'expired';

export interface Subscription {
  plan: BillingPlan;
  status: SubscriptionStatus;
  /** The paid period: from this day up to (and including) periodEnd. */
  periodStart: Date;
  periodEnd: Date;
}

/** What the business uses now, counted against the plan's limits. */
export interface PlanUsage {
  branches: number;
  products: number;
  cashiers: number;
}

export const USAGE_KEYS = ['branches', 'products', 'cashiers'] as const;
export type UsageKey = (typeof USAGE_KEYS)[number];

/** How close a limit is: 'near' from 80%, 'full' at 100%. */
export type UsageLevel = 'ok' | 'near' | 'full';

export function usageLevel(used: number, limit: number | null): UsageLevel {
  if (limit === null || limit <= 0) return 'ok';
  if (used >= limit) return 'full';
  return used / limit >= 0.8 ? 'near' : 'ok';
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'failed';

export interface BillingInvoice {
  id: string;
  number: string;
  issuedAt: Date;
  /** Pay before this day to keep the subscription active. */
  dueAt: Date;
  periodStart: Date;
  periodEnd: Date;
  planName: string;
  /** In EGP. TODO(you): confirm whether invoices show tax lines. */
  amount: number;
  status: InvoiceStatus;
  paidAt: Date | null;
  /** How it was paid, as Paymob reports it, e.g. "Card •••• 4242". */
  paidWith: string | null;
}

/** Invoice page: the invoice plus who it's billed to. */
export interface InvoiceDetails extends BillingInvoice {
  businessName: string;
}

/** Result of switching plans, returned by your logic. */
export type ChangePlanResult = 'changed' | 'failed';

/** Limits the new plan would break, e.g. ['branches'] when 3 branches > 1 allowed. */
export function overLimits(plan: BillingPlan, usage: PlanUsage): UsageKey[] {
  return USAGE_KEYS.filter((key) => {
    const limit = plan.limits[key];
    return limit !== null && usage[key] > limit;
  });
}
