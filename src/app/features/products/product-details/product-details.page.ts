import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideLayers, LucideLock, LucidePencil, LucidePlus } from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import { ProductThumb } from '../components/product-thumb/product-thumb';
import { ShelfTag } from '../components/shelf-tag/shelf-tag';
import { VariantDrawer, VariantDrawerData } from '../components/variant-drawer/variant-drawer';
import { formatMoney, Product, ProductSaveResult, Variant, VariantForm } from '../products.models';

type Tab = 'details' | 'variants' | 'stock';

/**
 * One product (/products/:id): Details, Variants and Stock tabs.
 * Variants show as tags on a rail above their table; each one is added
 * on its own in a drawer. Without variants in the plan, the tab explains it.
 */
@Component({
  selector: 'app-product-details-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    LoadError,
    ProductThumb,
    ShelfTag,
    LucideLayers,
    LucideLock,
    LucidePencil,
    LucidePlus,
  ],
  templateUrl: './product-details.page.html',
  styleUrl: './product-details.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/products/<lang>.json (keys start with "products.").
  providers: [provideTranslocoScope('products')],
})
export class ProductDetailsPage {
  private readonly shell = inject(AppShell);
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();
  protected readonly session = inject(AppSession);
  protected readonly money = formatMoney;

  protected readonly productId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly product = signal<Product | null>(null);
  protected readonly variants = signal<Variant[]>([]);
  /** The plan includes product variants. */
  protected readonly variantsAllowed = signal(true);
  /** The variant added last: its tag stamps in and its row flashes. */
  protected readonly newVariantId = signal<string | null>(null);

  protected readonly tab = signal<Tab>('variants');

  constructor() {
    // Top bar: "Products › Linen shirt".
    effect(() => {
      const name = this.product()?.nameEn;
      const title = name ? { text: name } : { key: 'nav.products' };
      this.shell.setPage(title, [{ key: 'nav.products', link: '/products' }, title]);
    });
    this.load();
  }

  protected load(): void {
    // TODO(you): load the product (this.productId) and its variants,
    //  and whether the plan includes variants.
    //  - before: this.status.set('loading')
    //  - success: this.product.set(p); this.variants.set(list); this.variantsAllowed.set(…);
    //             this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected openVariant(variant?: Variant): void {
    const p = this.product();
    if (!p) return;
    const data: VariantDrawerData = {
      productName: p.nameEn,
      defaults: { price: p.sellingPrice, cost: p.costPrice, sku: p.sku },
      showCost: this.session.isManager(),
      variant,
      save: (value) => this.saveVariant(value, variant),
    };
    this.openDrawer<VariantForm, VariantDrawerData, VariantDrawer>(VariantDrawer, {
      data,
      injector: this.injector,
    }).closed.subscribe((saved) => {
      if (saved) this.tab.set('variants');
    });
  }

  /** Called by the drawer's Save. Return what happened; the drawer shows it. */
  protected async saveVariant(value: VariantForm, existing?: Variant): Promise<ProductSaveResult> {
    // TODO(you): create (or update `existing`) the variant.
    //  - success: update this.variants; this.newVariantId.set(id);
    //             toast "Variant added" ("Black / Large is ready to sell."); return 'saved'
    //  - SKU or barcode already used: return 'duplicate'
    //  - other failure: return 'failed'
    void value;
    void existing;
    return 'failed';
  }
}
