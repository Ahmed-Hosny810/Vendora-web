/**
 * - completed: paid and the receipt issued
 * - attention: paid, but the receipt wasn't issued (a manager finishes it)
 * - held: put on hold at the POS, not paid yet
 */
export type SaleStatus = 'completed' | 'attention' | 'held';

export interface SaleListItem {
  id: string;
  /** "R-NASR-000128"; empty for held sales (no receipt yet). */
  receiptNumber: string;
  createdAt: Date;
  customerName: string | null;
  cashierName: string;
  branchName: string;
  terminalName: string;
  /** "Cash", "Card + Cash" */
  paymentSummary: string;
  itemCount: number;
  total: number;
  status: SaleStatus;
}

/** Today, the last 7 days or the last 30 days. */
export type SalePeriod = 'today' | 'week' | 'month';
