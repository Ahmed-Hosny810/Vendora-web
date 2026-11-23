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
