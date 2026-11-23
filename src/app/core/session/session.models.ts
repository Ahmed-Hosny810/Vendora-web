import { BusinessType } from '../../features/onboarding/onboarding.models';

/** Roles a business user can have. Owner is the one who created the business. */
export type UserRole = 'owner' | 'admin' | 'cashier' | 'inventoryStaff';

export interface SessionUser {
  name: string;
  role: UserRole;
}

export interface SessionBusiness {
  name: string;
  type: BusinessType | '';
}

export interface BranchOption {
  id: string;
  name: string;
}

/** A notification in the bell panel. */
export interface AppNotification {
  id: string;
  title: string;
  text: string;
  createdAt: Date;
  unread: boolean;
  /** Picks the small icon. */
  kind: 'success' | 'invoice' | 'info' | 'warning';
}

/**
 * The owner's setup checklist on the overview, in order.
 * 'stock' only matters for tracked products; 'employees' is optional.
 */
export const SETUP_TASKS = [
  'branch',
  'terminal',
  'catalog',
  'products',
  'stock',
  'payments',
  'employees',
  'shift',
] as const;

export type SetupTask = (typeof SETUP_TASKS)[number];
