import {
  LucideCreditCard,
  LucideFolder,
  LucideIcon,
  LucideMonitor,
  LucidePackage,
  LucideReceiptText,
  LucideStore,
  LucideTag,
  LucideUserPlus,
} from '@lucide/angular';

import { SetupTask } from '../../core/session';

export interface SetupTaskView {
  key: SetupTask;
  icon: LucideIcon;
  /** Where Start goes. */
  link: string;
  /** Key under overview.setup.tags. */
  tag?: 'tracked' | 'optional';
}

export const SETUP_TASK_VIEWS: Record<SetupTask, SetupTaskView> = {
  branch: { key: 'branch', icon: LucideStore, link: '/branches/new' },
  terminal: { key: 'terminal', icon: LucideMonitor, link: '/branches' },
  catalog: { key: 'catalog', icon: LucideFolder, link: '/categories' },
  products: { key: 'products', icon: LucideTag, link: '/products/new' },
  stock: { key: 'stock', icon: LucidePackage, link: '/inventory/opening', tag: 'tracked' },
  payments: { key: 'payments', icon: LucideCreditCard, link: '/payment-methods' },
  employees: { key: 'employees', icon: LucideUserPlus, link: '/employees/invite', tag: 'optional' },
  shift: { key: 'shift', icon: LucideReceiptText, link: '/pos' },
};
