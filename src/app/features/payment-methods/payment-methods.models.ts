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
