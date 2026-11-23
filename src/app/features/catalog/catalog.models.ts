export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  /** null = a top-level category. */
  parentId: string | null;
  /** Lower numbers show first on the POS. */
  sortOrder: number;
  /** Shown on the POS and in product lists. */
  visible: boolean;
}

/** What the category drawer edits. parentId '' = top level. */
export interface CategoryForm {
  nameEn: string;
  nameAr: string;
  parentId: string;
  sortOrder: number;
  visible: boolean;
}

export interface Unit {
  id: string;
  name: string;
  /** Short symbol on receipts and quantities: pc, m, kg. */
  symbol: string;
  /** Quantities like 0.5 kg are allowed. */
  allowFractions: boolean;
}

export type UnitForm = Omit<Unit, 'id'>;

export interface TaxRate {
  id: string;
  /** As it appears on receipts. */
  name: string;
  /** Percent, 0–100. */
  rate: number;
  /** New products start with this rate. Only one rate is the default. */
  isDefault: boolean;
}

export type TaxRateForm = Omit<TaxRate, 'id'>;

export const CATALOG_LIMITS = {
  categoryName: 150,
  unitName: 80,
  unitSymbol: 20,
  taxName: 80,
} as const;

/**
 * What saving a drawer can come back with.
 * 'duplicate' = the name (or unit symbol) is already used.
 */
export type CatalogSaveResult = 'saved' | 'duplicate' | 'failed';
