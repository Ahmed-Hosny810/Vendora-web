/** A terminal the cashier can open a shift on. */
export interface ShiftTerminal {
  id: string;
  name: string;
  branchId: string;
}

/** What the open-shift form sends. */
export interface OpenShiftForm {
  branchId: string;
  terminalId: string;
  openingCash: number;
}

/**
 * - 'opened'
 * - 'terminalBusy': another cashier's shift uses this terminal (set terminalBusyBy)
 * - 'failed': anything else
 */
export type OpenShiftResult = 'opened' | 'terminalBusy' | 'failed';

/** A shift that is open now (yours). */
export interface OpenShift {
  id: string;
  branchName: string;
  terminalName: string;
  openedAt: Date;
  openingCash: number;
}

/** A payment method's total that isn't cash (Card, Mobile wallet). */
export interface NonCashTotal {
  name: string;
  amount: number;
}

/** The numbers on the close-shift page. */
export interface ShiftSummary extends OpenShift {
  cashierName: string;
  /** Cash taken and kept (after change given). */
  cashReceipts: number;
  /** Cash paid back for refunds on this shift (a positive number). */
  cashRefunds: number;
  nonCash: NonCashTotal[];
}

/** Something that must be finished before the shift can close. */
export interface ShiftBlocker {
  id: string;
  /** 'attention': a sale needs attention. 'held': sales on hold. */
  kind: 'attention' | 'held';
  title: string;
  text: string;
  /** Where to resolve it. */
  link: string;
}

/** What the close-shift form sends. */
export interface CloseShiftForm {
  countedCash: number;
  note: string;
}

export type CloseShiftResult = 'closed' | 'blocked' | 'failed';

export type CashDiffKind = 'balanced' | 'shortage' | 'overage';

/** Opening cash + receipts − refunds. */
export function expectedCash(s: ShiftSummary): number {
  return round2(s.openingCash + s.cashReceipts - s.cashRefunds);
}

export function diffKind(diff: number): CashDiffKind {
  if (Math.abs(diff) < 0.005) return 'balanced';
  return diff < 0 ? 'shortage' : 'overage';
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** 1234.5 → "1,234.50" (always Latin digits, like the receipts). */
export function formatCash(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 50 → "+50.00", -50 → "−50.00" (a real minus sign). */
export function formatSigned(value: number): string {
  if (Math.abs(value) < 0.005) return '0.00';
  return (value < 0 ? '−' : '+') + formatCash(Math.abs(value));
}

/** "09:02" */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** "21/11 18:11" */
export function formatDayTime(date: Date): string {
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  return `${day} ${formatTime(date)}`;
}
