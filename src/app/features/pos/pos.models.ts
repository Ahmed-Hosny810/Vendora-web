// ---------- Catalogue on the POS ----------

/** One choice in an option group: "White" (with its colour) or "M". */
export interface PosOptionValue {
  value: string;
  /** "#fffef7": shown as a colour dot. Leave it out for sizes and other text options. */
  swatch?: string;
}

/** "Colour" with White / Sand / Black, or "Size" with S / M / L. */
export interface PosOption {
  name: string;
  values: PosOptionValue[];
}

/** One sellable combination ("White / M"). `values` follows the product's `options` order. */
export interface PosVariant {
  id: string;
  name: string;
  values: string[];
  price: number;
  sku: string;
  barcode: string;
  /** Left at this branch; null when the product doesn't track inventory. */
  stock: number | null;
}

export interface PosProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  categoryId: string;
  price: number;
  sku: string;
  barcode: string;
  imageUrl: string | null;
  /** Tax rate in % (14 for 14%). */
  taxRate: number;
  /** Left at this branch; null when not tracked. For variant products use each variant's stock. */
  stock: number | null;
  /** Empty for products without variants. */
  options: PosOption[];
  variants: PosVariant[];
}

export interface PosCategory {
  id: string;
  name: string;
}

// ---------- The basket ----------

/** A discount on one line or on the whole sale. */
export interface Discount {
  type: 'percent' | 'amount';
  value: number;
  /** Why ("Loyal customer", "Bundle offer"): saved with the sale. */
  reason: string;
}

export interface CartLine {
  /** productId, or productId:variantId: the same item adds to the same line. */
  key: string;
  productId: string;
  variantId: string | null;
  name: string;
  /** "White / Medium", or '' */
  variantName: string;
  unitPrice: number;
  qty: number;
  taxRate: number;
  /** Left at this branch when added; null when not tracked. */
  stock: number | null;
  discount: Discount | null;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
}

/** What the "new customer" form sends. */
export interface CustomerForm {
  fullName: string;
  phone: string;
  area: string;
  city: string;
  address: string;
  notes: string;
}

// ---------- Totals ----------

export interface LineTotals {
  gross: number;
  discount: number;
  net: number;
}

export interface SaleTotals {
  /** Before any discount. */
  subtotal: number;
  /** Line discounts + the sale discount. */
  discounts: number;
  tax: number;
  total: number;
  /** 14 when every line has the same rate, otherwise null ("Tax"). */
  taxRate: number | null;
  itemCount: number;
}

export function lineTotals(line: CartLine): LineTotals {
  const gross = round2(line.unitPrice * line.qty);
  const discount = discountOf(line.discount, gross);
  return { gross, discount, net: round2(gross - discount) };
}

/**
 * The totals shown while selling. Prices are before tax:
 *   subtotal − line discounts − sale discount = taxable; tax per line rate; total = taxable + tax.
 * The sale discount is shared across lines by their value, so each line is taxed on what it really costs.
 * The server recalculates everything when the sale is saved; this is only for the screen.
 */
export function saleTotals(lines: CartLine[], saleDiscount: Discount | null): SaleTotals {
  const rows = lines.map((l) => ({ line: l, t: lineTotals(l) }));
  const subtotal = round2(sum(rows.map((r) => r.t.gross)));
  const afterLines = round2(sum(rows.map((r) => r.t.net)));
  const saleCut = discountOf(saleDiscount, afterLines);
  const tax = round2(
    sum(
      rows.map((r) => {
        const share = afterLines > 0 ? r.t.net / afterLines : 0;
        return (r.t.net - saleCut * share) * (r.line.taxRate / 100);
      }),
    ),
  );
  const taxable = round2(afterLines - saleCut);
  const rates = new Set(lines.map((l) => l.taxRate));
  return {
    subtotal,
    discounts: round2(subtotal - taxable),
    tax,
    total: round2(taxable + tax),
    taxRate: rates.size === 1 ? [...rates][0] : null,
    itemCount: sum(lines.map((l) => l.qty)),
  };
}

/** How much a discount takes off `base` (never more than base). */
export function discountOf(discount: Discount | null, base: number): number {
  if (!discount || base <= 0) return 0;
  const cut = discount.type === 'percent' ? (base * discount.value) / 100 : discount.value;
  return round2(Math.min(Math.max(cut, 0), base));
}

/** "−10%" or "−50.00" */
export function discountLabel(d: Discount): string {
  return d.type === 'percent' ? `−${d.value}%` : `−${formatMoney(d.value)}`;
}

/** More in the basket than is left (only for tracked items). */
export function overStock(line: CartLine): boolean {
  return line.stock !== null && line.qty > line.stock;
}

// ---------- Helpers ----------

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** 1234.5 → "1,234.50" (Latin digits, like receipts). */
export function formatMoney(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** The variant with these option values, if any. */
export function findVariant(product: PosProduct, values: string[]): PosVariant | undefined {
  return product.variants.find((v) => v.values.every((x, i) => x === values[i]));
}

/** A basket line for a product (and variant). */
export function toLine(product: PosProduct, variant: PosVariant | null, qty = 1): CartLine {
  return {
    key: variant ? `${product.id}:${variant.id}` : product.id,
    productId: product.id,
    variantId: variant?.id ?? null,
    name: product.nameEn,
    variantName: variant?.name ?? '',
    unitPrice: variant?.price ?? product.price,
    qty,
    taxRate: product.taxRate,
    stock: variant ? variant.stock : product.stock,
    discount: null,
  };
}

// ---------- Checkout ----------

/** A payment method as checkout needs it (active ones, in sort order). */
export interface CheckoutMethod {
  id: string;
  name: string;
  code: string;
  /** Counts toward the cash drawer and gives change. */
  isCash: boolean;
  /** The cashier must type the transaction reference. */
  requiresReference: boolean;
}

/** A payment taken during checkout. */
export interface CheckoutPayment {
  methodId: string;
  name: string;
  /** What it pays off the sale (never more than was left). */
  amount: number;
  /** Cash only: what the customer handed over. */
  received: number | null;
  /** Cash only: what goes back to the customer. */
  change: number;
  reference: string;
}

/** Which picture a payment method gets: cash, a wallet, or a card for the rest. */
export function methodKind(m: {
  isCash: boolean;
  name: string;
  code: string;
}): 'cash' | 'wallet' | 'card' {
  if (m.isCash) return 'cash';
  return /wallet/i.test(`${m.name} ${m.code}`) ? 'wallet' : 'card';
}

/** Round amounts a customer might hand over: 1,760.16 → 1,800 · 2,000 · 2,500. */
export function cashSuggestions(due: number): number[] {
  if (due <= 0) return [];
  const up = (step: number) => Math.ceil(due / step) * step;
  const list = [up(100), up(500), up(1000), up(500) + 500].filter((v) => v > due);
  return [...new Set(list)].sort((a, b) => a - b).slice(0, 3);
}

// ---------- Receipts ----------

export interface ReceiptLine {
  qty: number;
  name: string;
  variantName: string;
  /** Before the line discount. */
  gross: number;
  /** "Discount 10%" or '' */
  discountLabel: string;
  discount: number;
}

export interface ReceiptPayment {
  name: string;
  /** What was handed over (cash) or charged. */
  amount: number;
  reference: string;
}

/** A receipt as issued (the server's numbers; never recalculated here). */
export interface Receipt {
  number: string;
  issuedAt: Date;
  businessName: string;
  /** "Nasr City · 14 Abbas El Akkad St." */
  branchLine: string;
  /** "Thank you for shopping with us!" */
  footer: string;
  terminalName: string;
  cashierName: string;
  customerName: string | null;
  lines: ReceiptLine[];
  subtotal: number;
  discounts: number;
  tax: number;
  taxRate: number | null;
  total: number;
  payments: ReceiptPayment[];
  change: number;
}

/** "21/11/2026 13:48" */
export function formatReceiptDate(date: Date): string {
  const d = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const t = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${d} ${t}`;
}

/** "21 Nov 2026, 13:48" in the page language. */
export function formatLongDate(date: Date, lang: string): string {
  const locale = lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
  const d = date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const t = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${d}, ${t}`;
}
