/** A way customers can pay at checkout (Cash, Card, Mobile wallet…). */
export interface PaymentMethod {
  id: string;
  name: string;
  /** "CASH", used in reports. */
  code: string;
  /** Counts toward the cash drawer and gives change. */
  isCash: boolean;
  /** Cashiers must type the transaction reference. */
  requiresReference: boolean;
  /** Lower numbers show first at checkout. */
  sortOrder: number;
  active: boolean;
}

/** What the drawer sends. */
export interface PaymentMethodForm {
  name: string;
  code: string;
  isCash: boolean;
  requiresReference: boolean;
  sortOrder: number;
}

export const PAYMENT_LIMITS = { name: 80, code: 50 } as const;

/** Letters, numbers, "-" and "_" (INSTAPAY, MOBILE_WALLET). */
export const PAYMENT_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * - 'saved'
 * - 'codeTaken': another method already uses this code
 * - 'failed': anything else
 */
export type PaymentSaveResult = 'saved' | 'codeTaken' | 'failed';

/** Which picture a method gets: banknote, wallet or card. */
export function paymentIcon(
  m: Pick<PaymentMethod, 'isCash' | 'name' | 'code'>,
): 'cash' | 'wallet' | 'card' {
  if (m.isCash) return 'cash';
  return /wallet/i.test(`${m.name} ${m.code}`) ? 'wallet' : 'card';
}

/** How much a method was used in the last 30 days. */
export interface PaymentMethodStats {
  /** Payments taken with it. */
  count: number;
  /** In EGP. */
  amount: number;
  /** Its share of all payments' amount, 0–100. */
  share: number;
}

/** One payment taken with the method, for the "Recent payments" table. */
export interface PaymentRecord {
  id: string;
  saleId: string;
  receiptNumber: string;
  at: Date;
  amount: number;
  /** The transaction reference the cashier typed, when the method requires one. */
  reference: string | null;
  cashierName: string;
  branchName: string;
}
