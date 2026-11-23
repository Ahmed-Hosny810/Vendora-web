import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideLock, LucidePackage, LucidePencil, LucidePlus, LucideSearch } from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { ProductThumb } from '../components/product-thumb/product-thumb';
import { ShelfTag } from '../components/shelf-tag/shelf-tag';
import { formatMoney, ProductListItem } from '../products.models';

type Filter = 'all' | 'tracked' | 'inactive';

/**
 * Products (/products): search by name, SKU or barcode, quick filters,
 * and a table. The Cost column is shown to owners and managers only.
 */
@Component({
  selector: 'app-products-list-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    ProductThumb,
    ShelfTag,
    LucideLock,
    LucidePackage,
    LucidePencil,
    LucidePlus,
    LucideSearch,
  ],
  templateUrl: './products-list.page.html',
  styleUrl: './products-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/products/<lang>.json (keys start with "products.").
  providers: [provideTranslocoScope('products')],
})
export class ProductsListPage {
  protected readonly session = inject(AppSession);
  protected readonly money = formatMoney;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly products = signal<ProductListItem[]>([]);

  // ---------- Search and filter (on the loaded list) ----------
  /** TODO(you): with many products, search on the server instead. */
  protected readonly query = signal('');
  protected readonly filter = signal<Filter>('all');
  protected readonly filters: Filter[] = ['all', 'tracked', 'inactive'];

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return this.products()
      .filter((p) => (f === 'tracked' ? p.trackInventory : f === 'inactive' ? !p.active : true))
      .filter(
        (p) =>
          !q || [p.nameEn, p.nameAr, p.sku, p.barcode].some((s) => s.toLowerCase().includes(q)),
      );
  });

  constructor() {
    inject(AppShell).setPage({ key: 'nav.products' }, [{ key: 'nav.products' }]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the products (cost is null when the user may not see it).
    //  - before: this.status.set('loading')
    //  - success: this.products.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }
}
