import {
  LucideBanknote,
  LucideChartColumn,
  LucideCreditCard,
  LucidePackage,
  LucideReceipt,
  LucideTag,
  LucideUsers,
  LucideWallet,
} from '@lucide/angular';

import { BranchBar, DemoProduct, IconType } from './home.models';

// ============================================================
// Illustrative figures for the demo screens on the home page.
// They are NOT real data and never come from the API; they only
// make the pictures of the product look real. Text lives in
// public/i18n/home/*.json; only numbers and icons are here.
// ============================================================

export const DEMO_PRODUCTS: readonly DemoProduct[] = [
  { key: 'coffee', price: '420.00', tone: 'butter', icon: LucidePackage, stock: 42 },
  { key: 'mug', price: '285.00', tone: 'butter', icon: LucideTag, stock: 4 },
  { key: 'dates', price: '210.00', tone: 'mint', icon: LucidePackage, stock: 18 },
  { key: 'oil', price: '390.00', tone: 'pine', icon: LucidePackage, stock: 26 },
  { key: 'towel', price: '160.00', tone: 'butter', icon: LucideTag, stock: 18 },
  { key: 'wrap', price: '35.00', tone: 'mint', icon: LucideTag, stock: null },
];

export const BRANCH_BARS: readonly BranchBar[] = [
  { key: 'zamalek', amount: '21,310', share: 100 },
  { key: 'heliopolis', amount: '17,460', share: 82 },
  { key: 'newCairo', amount: '9,460', share: 44 },
];

/** Payment buttons in the POS demos. `amount` null = not used in this sale. */
export const DEMO_PAYMENTS: readonly {
  key: 'cash' | 'card' | 'wallet';
  icon: IconType;
  amount: string | null;
}[] = [
  { key: 'cash', icon: LucideBanknote, amount: '520.00' },
  { key: 'card', icon: LucideCreditCard, amount: '643.00' },
  { key: 'wallet', icon: LucideWallet, amount: null },
];

/** The four tabs of the "See it work" section, in order. */
export type ShowcaseTab = 'pos' | 'inventory' | 'reports' | 'team';
export const SHOWCASE_TABS: readonly { key: ShowcaseTab; icon: IconType }[] = [
  { key: 'pos', icon: LucideReceipt },
  { key: 'inventory', icon: LucidePackage },
  { key: 'reports', icon: LucideChartColumn },
  { key: 'team', icon: LucideUsers },
];

/** FAQ questions, in order. Text: home.faq.<key>.q / .a */
export const FAQ_KEYS = [
  'branches',
  'permissions',
  'walkIn',
  'returns',
  'lowStock',
  'renewal',
] as const;
