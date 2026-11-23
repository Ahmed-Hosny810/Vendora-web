import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucidePackage,
  LucidePackagePlus,
  LucideSearch,
  LucideSlidersHorizontal,
} from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { KpiCard, LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import { formatDateTime, formatQty } from '../../../shared/utils/format';
import { AdjustDrawer, AdjustDrawerData } from '../components/adjust-drawer/adjust-drawer';
import { AdjustForm, AdjustResult, StockItem, StockLevel, stockLevel } from '../inventory.models';

type Filter = 'all' | 'low' | 'out';

/**
 * Inventory (/inventory): what's on hand at the branch picked in the top bar.
 * Low and out-of-stock items are counted on top and can be filtered. Each row
 * opens the adjust drawer (received, damaged, recount…).
 */
@Component({
  selector: 'app-inventory-list-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    KpiCard,
    LucidePackage,
    LucidePackagePlus,
    LucideSearch,
    LucideSlidersHorizontal,
  ],
  templateUrl: './inventory-list.page.html',
  styleUrl: './inventory-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/inventory/<lang>.json (keys start with "inventory.").
  providers: [provideTranslocoScope('inventory')],
})
export class InventoryListPage {
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();
  protected readonly session = inject(AppSession);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly qty = formatQty;
  protected readonly dateTime = formatDateTime;
  protected readonly level = stockLevel;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  /** Tracked items at this branch. */
  protected readonly items = signal<StockItem[]>([]);
  /** Adjusted last: its row flashes once. */
  protected readonly newKey = signal<string | null>(null);

  protected readonly query = signal('');
  protected readonly filter = signal<Filter>('all');
  protected readonly filters: Filter[] = ['all', 'low', 'out'];

  protected readonly counts = computed(() => {
    const levels = this.items().map(stockLevel);
    const count = (l: StockLevel) => levels.filter((x) => x === l).length;
    return { all: levels.length, low: count('low'), out: count('out') };
  });

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return this.items()
      .filter((x) => f === 'all' || stockLevel(x) === f)
      .filter((x) => !q || [x.name, x.variantName, x.sku].some((v) => v.toLowerCase().includes(q)));
  });

  constructor() {
    inject(AppShell).setPage({ key: 'nav.inventory' }, [{ key: 'nav.inventory' }]);
    // Reload when the branch in the top bar changes.
    effect(() => {
      this.session.branchId();
      untracked(() => this.load());
    });
  }

  protected load(): void {
    // TODO(you): load the tracked items at this.session.branchId().
    //  - before: this.status.set('loading')
    //  - success: this.items.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected adjust(item: StockItem): void {
    const data: AdjustDrawerData = {
      item,
      branchName: this.session.branch()?.name ?? '',
      save: (value) => this.saveAdjustment(item, value),
    };
    this.openDrawer<AdjustForm, AdjustDrawerData, AdjustDrawer>(AdjustDrawer, {
      data,
      injector: this.injector,
    });
  }

  /** Called by the adjust drawer's Save. */
  protected async saveAdjustment(item: StockItem, value: AdjustForm): Promise<AdjustResult> {
    // TODO(you): save the adjustment for item.key at this branch.
    //  - success: update item.onHand (and updatedAt) in this.items; this.newKey.set(item.key);
    //             toast "Stock updated"; return 'saved'
    //  - would go below zero and that isn't allowed: return 'belowZero'
    //  - other failure: return 'failed'
    void item;
    void value;
    return 'failed';
  }
}
