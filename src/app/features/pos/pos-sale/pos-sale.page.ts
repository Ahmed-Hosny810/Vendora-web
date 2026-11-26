import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
  LucideClock,
  LucidePercent,
  LucideSearch,
  LucideTrash2,
  LucideUserPlus,
  LucideUserRound,
  LucideX,
} from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { LoadError } from '../../../shared/components/app';
import {
  ConfirmDialogData,
  injectDrawer,
  VdButton,
  VdConfirmDialog,
  VdIconButton,
} from '../../../shared/components/ui';
import { BasketLine } from '../components/basket-line/basket-line';
import { CustomerDrawer, CustomerDrawerData } from '../components/customer-drawer/customer-drawer';
import {
  DiscountDialog,
  DiscountDialogData,
  DiscountDialogResult,
} from '../components/discount-dialog/discount-dialog';
import { ProductTile } from '../components/product-tile/product-tile';
import {
  VariantDialog,
  VariantDialogData,
  VariantDialogResult,
} from '../components/variant-dialog/variant-dialog';
import {
  Customer,
  CustomerForm,
  discountLabel,
  discountOf,
  formatMoney,
  lineTotals,
  overStock,
  PosCategory,
  PosProduct,
  PosVariant,
  round2,
  toLine,
} from '../pos.models';
import { PosCart } from '../pos-cart';

/**
 * The selling screen (/pos): products on the left (search, categories, tiles),
 * the current sale on the right (customer, lines, totals, Discount, Hold, Charge).
 * F2 jumps to the search; scanning a barcode there and pressing Enter adds the item.
 */
@Component({
  selector: 'app-pos-sale-page',
  imports: [
    TranslocoDirective,
    VdButton,
    VdIconButton,
    LoadError,
    ProductTile,
    BasketLine,
    LucideClock,
    LucidePercent,
    LucideSearch,
    LucideTrash2,
    LucideUserPlus,
    LucideUserRound,
    LucideX,
  ],
  templateUrl: './pos-sale.page.html',
  styleUrl: './pos-sale.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/pos/<lang>.json (keys start with "pos.").
  providers: [provideTranslocoScope('pos')],
  host: { '(document:keydown.f2)': 'focusSearch($event)' },
})
export class PosSalePage {
  private readonly dialog = inject(Dialog);
  private readonly openDrawer = injectDrawer();
  private readonly injector = inject(Injector);
  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  protected readonly session = inject(AppSession);
  protected readonly money = formatMoney;
  protected readonly discountText = discountLabel;

  private readonly searchBox = viewChild<ElementRef<HTMLInputElement>>('search');

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly products = signal<PosProduct[]>([]);
  protected readonly categories = signal<PosCategory[]>([]);
  /** The business lets cashiers sell below zero stock. */
  protected readonly allowNegative = signal(false);
  /** The most this cashier may discount, in %. null = no limit. */
  protected readonly maxDiscountPercent = signal<number | null>(null);
  protected readonly holdStatus = signal<'idle' | 'holding'>('idle');

  // ---------- The sale on screen ----------
  protected readonly query = signal('');
  protected readonly category = signal<string>('all');
  // The basket lives in PosCart so checkout can read it.
  private readonly cart = inject(PosCart);
  protected readonly lines = this.cart.lines;
  protected readonly saleDiscount = this.cart.saleDiscount;
  protected readonly customer = this.cart.customer;
  /** Shown under the search when Enter finds nothing. */
  protected readonly notFound = signal(false);

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.category();
    return this.products().filter((p) => {
      if (cat !== 'all' && p.categoryId !== cat) return false;
      if (!q) return true;
      return (
        p.nameEn.toLowerCase().includes(q) ||
        p.nameAr.includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode === q ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q) || v.barcode === q)
      );
    });
  });

  protected readonly totals = this.cart.totals;
  /** What the sale discount takes off, for its row in the basket. */
  protected readonly saleDiscountCut = computed(() =>
    discountOf(
      this.saleDiscount(),
      round2(this.lines().reduce((s, l) => s + lineTotals(l).net, 0)),
    ),
  );
  protected readonly hasStockError = computed(() => this.lines().some(overStock));
  protected readonly canCharge = computed(
    () => this.lines().length > 0 && !this.hasStockError() && this.holdStatus() === 'idle',
  );

  constructor() {
    this.load();
  }

  protected load(): void {
    // TODO(you): load what the POS needs for this branch.
    //  - before: this.status.set('loading')
    //  - success: this.products.set(list); this.categories.set(list);
    //             this.allowNegative.set(settings.allowNegativeStock);
    //             this.maxDiscountPercent.set(role limit or null);
    //             the PosShell (inject it) shows the shift: terminalName + shift { openedAt, closed: false }
    //             this.status.set('ready')
    //  - no open shift: go to /pos/shift/open
    //  - failure: this.status.set('error')
  }

  // ---------- Adding ----------

  /** Adds to the line for the same item, or starts a new line. */
  protected add(product: PosProduct, variant: PosVariant | null, qty = 1): void {
    const line = toLine(product, variant, qty);
    this.lines.update((list) => {
      const found = list.find((l) => l.key === line.key);
      return found
        ? list.map((l) => (l.key === line.key ? { ...l, qty: l.qty + qty } : l))
        : [...list, line];
    });
    // TODO(you): automatic offers ("Bundle offer") can set a line's discount here.
  }

  protected choose(product: PosProduct): void {
    const data: VariantDialogData = {
      product,
      branchName: this.session.branch()?.name ?? '',
      allowNegative: this.allowNegative(),
    };
    this.dialog
      .open<VariantDialogResult, VariantDialogData, VariantDialog>(VariantDialog, {
        data,
        injector: this.injector,
      })
      .closed.subscribe((result) => {
        if (result) this.add(product, result.variant, result.qty);
      });
  }

  /** Enter in the search: an exact SKU or barcode adds it (scanners press Enter for you). */
  protected onSearchEnter(): void {
    const q = this.query().trim().toLowerCase();
    if (!q) return;
    for (const p of this.products()) {
      const variant = p.variants.find((v) => v.barcode === q || v.sku.toLowerCase() === q);
      if (variant) return this.addFromSearch(p, variant);
      if (p.barcode === q || p.sku.toLowerCase() === q) return this.addFromSearch(p, null);
    }
    // Only one product left in the grid: take it.
    const list = this.visible();
    if (list.length === 1) return this.addFromSearch(list[0], null);
    this.notFound.set(list.length === 0);
  }

  private addFromSearch(product: PosProduct, variant: PosVariant | null): void {
    if (!variant && product.variants.length) this.choose(product);
    else this.add(product, variant);
    this.query.set('');
    this.notFound.set(false);
  }

  protected onQuery(value: string): void {
    this.query.set(value);
    this.notFound.set(false);
  }

  protected focusSearch(event: Event): void {
    event.preventDefault();
    this.searchBox()?.nativeElement.focus();
  }

  // ---------- Basket ----------

  protected setQty(key: string, qty: number): void {
    this.lines.update((list) => list.map((l) => (l.key === key ? { ...l, qty } : l)));
  }

  protected removeLine(key: string): void {
    this.lines.update((list) => list.filter((l) => l.key !== key));
    if (!this.lines().length) this.saleDiscount.set(null);
  }

  protected clear(): void {
    if (!this.lines().length && !this.customer()) return;
    const t = (key: string) => this.transloco.translate(`pos.sale.${key}`);
    this.dialog
      .open<boolean, ConfirmDialogData>(VdConfirmDialog, {
        injector: this.injector,
        data: {
          title: t('clearTitle'),
          message: t('clearText'),
          confirmText: t('clearConfirm'),
          danger: true,
        },
      })
      .closed.subscribe((yes) => {
        if (yes) this.reset();
      });
  }

  private reset(): void {
    this.cart.reset();
  }

  protected openDiscount(): void {
    const data: DiscountDialogData = {
      lines: this.lines(),
      saleDiscount: this.saleDiscount(),
      maxPercent: this.maxDiscountPercent(),
    };
    this.dialog
      .open<DiscountDialogResult, DiscountDialogData, DiscountDialog>(DiscountDialog, {
        data,
        injector: this.injector,
      })
      .closed.subscribe((result) => {
        if (!result) return;
        if (result.target === 'sale') this.saleDiscount.set(result.discount);
        else
          this.lines.update((list) =>
            list.map((l) => (l.key === result.target ? { ...l, discount: result.discount } : l)),
          );
      });
  }

  protected openCustomer(): void {
    const data: CustomerDrawerData = {
      lookup: (phone) => this.findCustomer(phone),
      save: (value) => this.createCustomer(value),
    };
    this.openDrawer<Customer, CustomerDrawerData, CustomerDrawer>(CustomerDrawer, {
      data,
      injector: this.injector,
    }).closed.subscribe((customer) => {
      if (customer) this.customer.set(customer);
    });
  }

  /** Called by the customer drawer. */
  protected async findCustomer(phone: string): Promise<Customer | null | 'failed'> {
    // TODO(you): find the customer by phone. Found: return them. None: return null.
    //  Failure: return 'failed'.
    void phone;
    return 'failed';
  }

  /** Called by the customer drawer's "Save and attach". */
  protected async createCustomer(value: CustomerForm): Promise<Customer | 'phoneTaken' | 'failed'> {
    // TODO(you): create the customer (trim the text fields) and return it.
    //  Phone already used: 'phoneTaken'. Other failure: 'failed'.
    void value;
    return 'failed';
  }

  protected hold(): void {
    if (!this.lines().length || this.holdStatus() === 'holding') return;
    // TODO(you): hold this sale (lines, sale discount, customer).
    //  - before: this.holdStatus.set('holding')
    //  - success: this.holdStatus.set('idle'); toast "Sale on hold"; then this.cart.reset()
    //  - failure: this.holdStatus.set('idle'); toast the error
  }

  protected charge(): void {
    if (!this.canCharge()) return;
    // The basket is already in PosCart; checkout reads it from there.
    this.router.navigate(['/pos/checkout']);
  }
}
