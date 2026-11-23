/** A product that tracks inventory, as listed in the opening stock form. */
export interface StockProduct {
  id: string;
  name: string;
  /** "Piece" */
  unitName: string;
  /** "pc" */
  unitSymbol: string;
  /** The unit allows quantities like 0.5 (from the unit's settings). */
  allowFractions: boolean;
  /** Empty when the product has no variants. */
  variants: StockVariant[];
}

export interface StockVariant {
  id: string;
  name: string;
}

/** What the opening stock form sends. variantId is '' when the product has no variants. */
export interface OpeningStockForm {
  branchId: string;
  productId: string;
  variantId: string;
  quantity: number;
  lowStockThreshold: number;
}

/**
 * - 'saved'
 * - 'alreadyCounted': this item already has opening stock at this branch
 * - 'failed': anything else
 */
export type OpeningStockResult = 'saved' | 'alreadyCounted' | 'failed';

// ---------- Inventory list and adjustments ----------

export type StockLevel = 'in' | 'low' | 'out';

/** One tracked item (product or variant) at the branch. */
export interface StockItem {
  /** productId, or productId:variantId */
  key: string;
  productId: string;
  variantId: string | null;
  name: string;
  /** "White / Medium", or '' */
  variantName: string;
  sku: string;
  unitSymbol: string;
  allowFractions: boolean;
  onHand: number;
  /** 0 = no low-stock warning. */
  lowStockThreshold: number;
  updatedAt: Date | null;
}

export function stockLevel(item: StockItem): StockLevel {
  if (item.onHand <= 0) return 'out';
  return item.lowStockThreshold > 0 && item.onHand <= item.lowStockThreshold ? 'low' : 'in';
}

/** Add (received), remove (damaged, lost…) or set the counted amount. */
export type AdjustKind = 'add' | 'remove' | 'set';

export const ADJUST_REASONS = {
  add: ['received', 'returned', 'found', 'other'],
  remove: ['damaged', 'lost', 'supplierReturn', 'other'],
  set: ['count', 'other'],
} as const satisfies Record<AdjustKind, readonly string[]>;

export type AdjustReason = (typeof ADJUST_REASONS)[AdjustKind][number];

/** What the adjust drawer sends. */
export interface AdjustForm {
  kind: AdjustKind;
  quantity: number;
  reason: AdjustReason;
  note: string;
}

/** The on-hand amount after an adjustment. */
export function afterAdjust(onHand: number, kind: AdjustKind, quantity: number): number {
  const q = Number.isFinite(quantity) ? quantity : 0;
  if (kind === 'add') return onHand + q;
  if (kind === 'remove') return onHand - q;
  return q;
}

/**
 * - 'saved'
 * - 'belowZero': removing more than is on hand (when not allowed)
 * - 'failed': anything else
 */
export type AdjustResult = 'saved' | 'belowZero' | 'failed';
