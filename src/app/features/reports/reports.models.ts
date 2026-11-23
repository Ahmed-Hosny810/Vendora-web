/** today = by hour; week / month = by day. */
export type ReportPeriod = 'today' | 'week' | 'month';

/** One bar of the sales chart: an hour (today) or a day (week, month). */
export interface ReportPoint {
  /** Start of the hour or the day. */
  at: Date;
  /** Net sales in EGP. */
  amount: number;
  /** Completed sales in that hour or day. */
  count: number;
}

export interface ReportPayment {
  /** The payment method's name as the business typed it ("Cash", "Visa"…). */
  name: string;
  amount: number;
  count: number;
}

export interface ReportProduct {
  name: string;
  /** "Red / Large", or null for a product without variants. */
  variant: string | null;
  quantity: number;
  /** "pc", "kg"… */
  unitSymbol: string;
  revenue: number;
}

export interface ReportCashier {
  name: string;
  count: number;
  revenue: number;
}

/**
 * Everything the Reports page shows for one period at one branch.
 * TODO(you): confirm with the backend whether "net sales" is after
 * discounts and refunds, and whether it includes tax.
 */
export interface SalesReport {
  netSales: number;
  count: number;
  /** Items sold (sum of quantities). */
  items: number;
  /** Total discounts given in the period. */
  discounts: number;
  /** Bars, oldest first. */
  series: ReportPoint[];
  /** Biggest first. */
  payments: ReportPayment[];
  /** Best sellers by revenue, biggest first (up to 10). */
  topProducts: ReportProduct[];
  /** Biggest first. */
  cashiers: ReportCashier[];
}
