/** A product as the products table shows it. */
export interface ProductListItem {
  id: string;
  nameEn: string;
  nameAr: string;
  sku: string;
  barcode: string;
  categoryName: string;
  /** Selling price, EGP. */
  price: number;
  /** Cost price, EGP. null when the user may not see costs. */
  cost: number | null;
  trackInventory: boolean;
  active: boolean;
  variantCount: number;
  imageUrl: string | null;
}

/** What the add/edit product form edits. Ids are '' until chosen. */
export interface ProductForm {
  nameEn: string;
  nameAr: string;
  categoryId: string;
  unitId: string;
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  taxRateId: string;
  trackInventory: boolean;
}

/** A full product, for the details page and for filling the edit form. */
export interface Product extends ProductForm {
  id: string;
  categoryName: string;
  unitName: string;
  taxRateName: string;
  active: boolean;
  imageUrl: string | null;
}

export interface Variant {
  id: string;
  name: string;
  option1Name: string;
  option1Value: string;
  option2Name: string;
  option2Value: string;
  price: number;
  /** null when the user may not see costs. */
  cost: number | null;
  sku: string;
  barcode: string;
  active: boolean;
}

export interface VariantForm {
  name: string;
  option1Name: string;
  option1Value: string;
  option2Name: string;
  option2Value: string;
  price: number;
  cost: number;
  sku: string;
  barcode: string;
}

/** Options for the form's selects. */
export interface SelectOption {
  id: string;
  label: string;
}

export const PRODUCT_LIMITS = { name: 200, sku: 100, barcode: 100 } as const;

/** Image types the API accepts. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** What saving can come back with. 'duplicate' = SKU or barcode already used. */
export type ProductSaveResult = 'saved' | 'duplicate' | 'failed';

/** "1,450.00" */
export function formatMoney(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
