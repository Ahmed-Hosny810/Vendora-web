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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideHistory, LucideSlidersHorizontal } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { KpiCard, LoadError, SkeletonRows } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import { formatDateTime, formatQty } from '../../../shared/utils/format';
import { AdjustDrawer, AdjustDrawerData } from '../components/adjust-drawer/adjust-drawer';
import {
  AdjustForm,
  AdjustResult,
  MOVEMENT_KINDS,
  MovementKind,
  StockItem,
  stockLevel,
  StockMovement,
} from '../inventory.models';

/**
 * One item's stock history at the branch picked in the top bar
 * (/inventory/:productId/history, ?variant=<id> for a variant):
 * every sale, return, adjustment and the opening count, newest first,
 * with the count after each one.
 */
@Component({
  selector: 'app-stock-history-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    KpiCard,
    LoadError,
    SkeletonRows,
    LucideHistory,
    LucideSlidersHorizontal,
  ],
  templateUrl: './stock-history.page.html',
  styleUrl: './stock-history.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/inventory/<lang>.json (keys start with "inventory.").
  providers: [provideTranslocoScope('inventory')],
})
export class StockHistoryPage {
  protected readonly session = inject(AppSession);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly qty = formatQty;
  protected readonly dateTime = formatDateTime;
  protected readonly level = stockLevel;
  protected readonly kinds = MOVEMENT_KINDS;
  private readonly route = inject(ActivatedRoute).snapshot;
  /** From the URL: /inventory/<productId>/history?variant=<variantId>. */
  protected readonly productId = this.route.paramMap.get('productId') ?? '';
  protected readonly variantId = this.route.queryParamMap.get('variant');
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly item = signal<StockItem | null>(null);
  /** Newest first. */
  protected readonly movements = signal<StockMovement[]>([]);
  protected readonly hasMore = signal(false);
  protected readonly loadingMore = signal(false);

  // ---------- Filter ----------
  protected readonly kind = signal<'all' | MovementKind>('all');

  protected readonly visible = computed(() =>
    this.movements().filter((m) => this.kind() === 'all' || m.kind === this.kind()),
  );
  /** Added and removed across the loaded list. */
  protected readonly totals = computed(() => {
    const list = this.movements();
    return {
      added: list.filter((m) => m.change > 0).reduce((s, m) => s + m.change, 0),
      removed: Math.abs(list.filter((m) => m.change < 0).reduce((s, m) => s + m.change, 0)),
    };
  });

  constructor() {
    inject(AppShell).setPage({ key: 'pages.stockHistory' }, [
      { key: 'nav.inventory', link: '/inventory' },
      { key: 'pages.stockHistory' },
    ]);
    // Reload when the branch in the top bar changes.
    effect(() => {
      this.session.branchId();
      untracked(() => this.load());
    });
  }

  protected load(): void {
    // TODO(you): load the item (this.productId, this.variantId) and its latest changes
    //  at this.session.branchId(), e.g. 50 at a time.
    //  - before: this.status.set('loading')
    //  - success: this.item.set(item); this.movements.set(list); this.hasMore.set(more exist);
    //             this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected loadMore(): void {
    if (this.loadingMore()) return;
    // TODO(you): load the next (older) changes and add them to the end of this.movements.
    //  - before: this.loadingMore.set(true); after: this.loadingMore.set(false)
    //  - set this.hasMore(false) when there are no more
  }

  protected adjust(): void {
    const item = this.item();
    if (!item) return;
    this.openDrawer<AdjustForm, AdjustDrawerData, AdjustDrawer>(AdjustDrawer, {
      data: {
        item,
        branchName: this.session.branch()?.name ?? '',
        save: (value) => this.saveAdjustment(value),
      },
      injector: this.injector,
    });
  }

  private async saveAdjustment(value: AdjustForm): Promise<AdjustResult> {
    // TODO(you): save the adjustment (same call as the inventory list), then
    //  reload (this.load()) so the new change shows on top; toast "Stock updated";
    //  return 'saved'. Below zero not allowed: 'belowZero'. Other failure: 'failed'.
    void value;
    return 'failed';
  }

  /** +12 / −3, with a real minus sign. */
  protected signed(n: number): string {
    return (n > 0 ? '+' : n < 0 ? '−' : '') + formatQty(Math.abs(n));
  }
}
