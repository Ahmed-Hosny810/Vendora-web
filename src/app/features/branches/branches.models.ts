export interface Branch {
  id: string;
  nameEn: string;
  nameAr: string;
  /** Short code for reports: letters, numbers, - and _. */
  code: string;
  city: string;
  address: string;
  phone: string;
  /** Printed at the top of every receipt from this branch. */
  receiptHeader: string;
  isMain: boolean;
  allowNegativeStock: boolean;
  active: boolean;
}

/** What the add/edit branch form edits. */
export type BranchForm = Omit<Branch, 'id' | 'active'>;

export interface Terminal {
  id: string;
  branchId: string;
  name: string;
  /** The owner's own label for the counter (Vendora doesn't detect devices). */
  deviceCode: string;
  active: boolean;
}

export type TerminalForm = Pick<Terminal, 'branchId' | 'name' | 'deviceCode'>;

/** Letters, numbers, hyphens and underscores; no spaces. Used for branch and device codes. */
export const CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

export const BRANCH_LIMITS = {
  name: 150,
  code: 50,
  city: 100,
  address: 500,
  phone: 30,
  receiptHeader: 500,
} as const;

export const TERMINAL_LIMITS = { name: 150, deviceCode: 100 } as const;

/** What saving a form can come back with. */
export type SaveResult = 'saved' | 'codeTaken' | 'failed';
