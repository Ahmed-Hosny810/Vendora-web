export interface CustomerListItem {
  id: string;
  fullName: string;
  phone: string;
  /** "Nasr City, Cairo" or '' */
  place: string;
  salesCount: number;
  totalSpent: number;
  lastVisit: Date | null;
}

export interface CustomerDetails {
  id: string;
  fullName: string;
  phone: string;
  area: string;
  city: string;
  address: string;
  notes: string;
  createdAt: Date;
  salesCount: number;
  totalSpent: number;
  lastVisit: Date | null;
}

/** One of the customer's sales. */
export interface CustomerSale {
  id: string;
  receiptNumber: string;
  createdAt: Date;
  branchName: string;
  itemCount: number;
  total: number;
}

/** What the add/edit drawer sends. */
export interface CustomerForm {
  fullName: string;
  phone: string;
  area: string;
  city: string;
  address: string;
  notes: string;
}

export const CUSTOMER_LIMITS = {
  fullName: 150,
  phone: 30,
  area: 100,
  city: 100,
  address: 300,
  notes: 500,
} as const;

/**
 * - 'saved'
 * - 'phoneTaken': another customer has this phone
 * - 'failed': anything else
 */
export type CustomerSaveResult = 'saved' | 'phoneTaken' | 'failed';
