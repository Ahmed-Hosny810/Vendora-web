import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideMonitor,
  LucideReceiptText,
  LucideSearch,
  LucideTriangleAlert,
} from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { KpiCard, LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { formatDateTime, formatMoney } from '../../../shared/utils/format';
import { SaleListItem, SalePeriod, SaleStatus } from '../sales.models';

type StatusFilter = 'all' | SaleStatus;

/**
 * Sales (/sales): what was sold at the branch picked in the top bar, for a
 * period. Totals on top, then a table. Sales that need attention are
 * highlighted so a manager can finish them.
 */
@Component({
  selector: 'app-sales-list-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    KpiCard,
    LucideMonitor,
    LucideReceiptText,
    LucideSearch,
    LucideTriangleAlert,
  ],
  templateUrl: './sales-list.page.html',
  styleUrl: './sales-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/sales/<lang>.json (keys start with "sales.").
  providers: [provideTranslocoScope('sales')],
})
export class SalesListPage {
  protected readonly session = inject(AppSession);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly dateTime = formatDateTime;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly sales = signal<SaleListItem[]>([]);
  /** Ids being finished ("needs attention" → completed). */
  protected readonly busyIds = signal<string[]>([]);

  // ---------- Filters ----------
  protected readonly period = signal<SalePeriod>('today');
  protected readonly periods: SalePeriod[] = ['today', 'week', 'month'];
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly statuses: StatusFilter[] = ['all', 'completed', 'attention', 'held'];
  /** Receipt number, customer or cashier (on the loaded list). */
  protected readonly query = signal('');

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const s = this.statusFilter();
    return this.sales()
      .filter((x) => s === 'all' || x.status === s)
      .filter(
        (x) =>
          !q ||
          [x.receiptNumber, x.customerName ?? '', x.cashierName].some((v) =>
            v.toLowerCase().includes(q),
          ),
      );
  });

  /** Totals of completed sales in the period. */
  protected readonly kpis = computed(() => {
    const done = this.sales().filter((x) => x.status === 'completed');
    const revenue = done.reduce((s, x) => s + x.total, 0);
    return {
      count: done.length,
      revenue,
      average: done.length ? revenue / done.length : null,
      attention: this.sales().filter((x) => x.status === 'attention').length,
    };
  });

  constructor() {
    inject(AppShell).setPage({ key: 'nav.sales' }, [{ key: 'nav.sales' }]);
    // Reload when the period or the branch in the top bar changes.
    effect(() => {
      this.period();
      this.session.branchId();
      untracked(() => this.load());
    });
  }

  protected load(): void {
    // TODO(you): load the sales of this.period() at this.session.branchId().
    //  - before: this.status.set('loading')
    //  - success: this.sales.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected finish(sale: SaleListItem): void {
    // TODO(you): try issuing the receipt of a sale that needs attention.
    //  - before: this.busyIds.update((ids) => [...ids, sale.id])
    //  - after: remove sale.id from busyIds
    //  - success: set its status to 'completed' (and its receiptNumber) in this.sales
    //  - failure: toast the error
    void sale;
  }

  protected isBusy(id: string): boolean {
    return this.busyIds().includes(id);
  }
}
