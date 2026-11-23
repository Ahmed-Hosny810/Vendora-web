import {
  LucideChartColumn,
  LucideCreditCard,
  LucideFolder,
  LucideHistory,
  LucideHouse,
  LucideIcon,
  LucideMonitor,
  LucidePackage,
  LucidePercent,
  LucideReceiptText,
  LucideScale,
  LucideSlidersVertical,
  LucideStore,
  LucideTag,
  LucideUserPlus,
  LucideUsers,
  LucideWallet,
} from '@lucide/angular';

import { UserRole } from '../../core/session';

export interface NavItem {
  /** Key under shell.nav in the translation files. */
  key: string;
  icon: LucideIcon;
  link: string;
  /** Who sees it. Leave out = owners and admins only. */
  roles?: UserRole[];
}

export interface NavGroup {
  /** Key under shell.groups, or null for the top items without a caption. */
  key: string | null;
  items: NavItem[];
}

const EVERYONE: UserRole[] = ['owner', 'admin', 'cashier', 'inventoryStaff'];
const SELLERS: UserRole[] = ['owner', 'admin', 'cashier'];
const STOCK: UserRole[] = ['owner', 'admin', 'inventoryStaff'];

/**
 * The sidebar, top to bottom.
 * TODO(you): confirm what inventory staff can open (drawn here: catalog and inventory).
 */
export const APP_NAV: NavGroup[] = [
  {
    key: null,
    items: [
      { key: 'overview', icon: LucideHouse, link: '/overview', roles: EVERYONE },
      { key: 'pos', icon: LucideMonitor, link: '/pos', roles: SELLERS },
    ],
  },
  {
    key: 'sell',
    items: [
      { key: 'sales', icon: LucideReceiptText, link: '/sales', roles: SELLERS },
      { key: 'customers', icon: LucideUsers, link: '/customers', roles: SELLERS },
      { key: 'shifts', icon: LucideHistory, link: '/shifts', roles: SELLERS },
    ],
  },
  {
    key: 'catalog',
    items: [
      { key: 'products', icon: LucideTag, link: '/products', roles: STOCK },
      { key: 'categories', icon: LucideFolder, link: '/categories', roles: STOCK },
      { key: 'units', icon: LucideScale, link: '/units', roles: STOCK },
      { key: 'taxRates', icon: LucidePercent, link: '/tax-rates' },
    ],
  },
  {
    key: 'stock',
    items: [{ key: 'inventory', icon: LucidePackage, link: '/inventory', roles: STOCK }],
  },
  {
    key: 'business',
    items: [
      { key: 'branches', icon: LucideStore, link: '/branches' },
      { key: 'employees', icon: LucideUserPlus, link: '/employees' },
      { key: 'reports', icon: LucideChartColumn, link: '/reports' },
      { key: 'billing', icon: LucideWallet, link: '/billing' },
      { key: 'paymentMethods', icon: LucideCreditCard, link: '/payment-methods' },
      { key: 'settings', icon: LucideSlidersVertical, link: '/settings' },
    ],
  },
];

/** The nav filtered for one role; empty groups are dropped. */
export function navFor(role: UserRole | null): NavGroup[] {
  const allowed = (item: NavItem) => (item.roles ?? ['owner', 'admin']).includes(role as UserRole);
  return APP_NAV.map((group) => ({ ...group, items: group.items.filter(allowed) })).filter(
    (group) => group.items.length > 0,
  );
}
