/** Business types, in the order the select lists them. Keys match the API values (TODO(you): confirm). */
export const BUSINESS_TYPES = [
  'restaurant',
  'cafe',
  'grocery',
  'minimarket',
  'pharmacy',
  'clothing',
  'furniture',
  'cosmetics',
  'accessories',
  'electronics',
  'salon',
  'retail',
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

/** Step 1. `type` is '' until the owner picks one. */
export interface BusinessDetails {
  nameEn: string;
  nameAr: string;
  type: BusinessType | '';
  inventory: 'track' | 'none';
}

export const NAME_MAX_LENGTH = 200;

/** A subscription plan as the plan cards show it. `null` limit = unlimited. */
export interface OnboardingPlan {
  id: string;
  name: string;
  description: string;
  /** Monthly price in EGP. */
  price: number;
  limits: {
    branches: number | null;
    products: number | null;
    cashiers: number | null;
    variants: boolean;
  };
}

/** The first invoice, shown on step 4. */
export interface OnboardingInvoice {
  number: string;
  businessName: string;
  planName: string;
  /** Amount due in EGP. */
  amount: number;
}

/** What the payment-status page shows after Paymob sends the owner back. */
export type PaymentStatus = 'waiting' | 'failed' | 'activating' | 'active';

/** Welcome checklist, in order. 'stock' only appears when inventory is tracked. */
export const CHECKLIST_KEYS = [
  'branch',
  'terminal',
  'products',
  'stock',
  'employees',
  'shift',
  'sale',
] as const;

export type ChecklistKey = (typeof CHECKLIST_KEYS)[number];
