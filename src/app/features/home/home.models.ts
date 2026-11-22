import { LucideIcon } from '@lucide/angular';

/** A Lucide icon class, e.g. LucidePackage. Shown with <svg [lucideIcon]="icon">. */
export type IconType = LucideIcon;

/** Background colour of a product picture in the demo screens. */
export type ProductTone = 'butter' | 'mint' | 'pine';

/** A product in the demo screens. Names come from home.products.<key>. */
export interface DemoProduct {
  key: 'coffee' | 'mug' | 'dates' | 'oil' | 'towel' | 'wrap';
  price: string;
  tone: ProductTone;
  icon: IconType;
  /** Units in stock; null = stock isn't tracked (a service). */
  stock: number | null;
}

/** One bar in the hero's "Today · 3 branches" card. */
export interface BranchBar {
  key: 'zamalek' | 'heliopolis' | 'newCairo';
  amount: string;
  /** Bar length, 0–100. */
  share: number;
}

// ---------- Pricing (real data, from billing) ----------

/** How long one payment covers, e.g. monthly or yearly. */
export interface BillingOption {
  id: string;
  /** Already translated, e.g. "Monthly". */
  label: string;
}

/** A plan card. null in a limit means "unlimited". */
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Currency code, e.g. "EGP". */
  currency: string;
  /** Already translated, e.g. "month". Shown as "/ month". */
  period: string;
  limits: {
    branches: number | null;
    terminals: number | null;
    employees: number | null;
  };
}
