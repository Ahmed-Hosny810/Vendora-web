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
import { LucideChartColumn, LucideDownload, LucideMonitor } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { KpiCard, LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { formatMoney, formatQty } from '../../../shared/utils/format';
import { SalesChart } from '../components/sales-chart/sales-chart';
import { ShareBars, ShareRow } from '../components/share-bars/share-bars';
import { ReportPeriod, SalesReport } from '../reports.models';

/**
 * Reports (/reports), owners and admins: how the branch picked in the top
 * bar sold over a period. Four totals, sales by hour or day, payment
 * methods, best sellers and cashiers.
 */
@Component({
  selector: 'app-reports-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    KpiCard,
    SalesChart,
    ShareBars,
    LucideChartColumn,
    LucideDownload,
    LucideMonitor,
  ],
  templateUrl: './reports.page.html',
  styleUrl: './reports.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/reports/<lang>.json (keys start with "reports.").
  providers: [provideTranslocoScope('reports')],
})
export class ReportsPage {
  protected readonly session = inject(AppSession);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly qty = formatQty;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly report = signal<SalesReport | null>(null);
  protected readonly exporting = signal(false);

  // ---------- Filters ----------
  protected readonly period = signal<ReportPeriod>('week');
  protected readonly periods: ReportPeriod[] = ['today', 'week', 'month'];

  protected readonly average = computed(() => {
    const r = this.report();
    return r && r.count ? r.netSales / r.count : null;
  });

  /** "Cash · 46% · 120 sales" rows for the payments list. */
  protected readonly paymentRows = computed<ShareRow[]>(() => {
    const r = this.report();
    if (!r) return [];
    const total = r.payments.reduce((sum, p) => sum + p.amount, 0);
    return r.payments.map((p) => ({
      label: p.name,
      value: p.amount,
      figure: formatMoney(p.amount),
      note: {
        key: p.count === 1 ? 'reports.page.paymentNoteOne' : 'reports.page.paymentNote',
        params: { share: total ? Math.round((p.amount / total) * 100) : 0, count: p.count },
      },
    }));
  });

  protected readonly productRows = computed<ShareRow[]>(() => {
    const r = this.report();
    if (!r) return [];
    return r.topProducts.map((p) => ({
      label: p.name,
      sub: p.variant,
      value: p.revenue,
      figure: formatMoney(p.revenue),
      note: {
        key: 'reports.page.soldQty',
        params: { qty: formatQty(p.quantity), unit: p.unitSymbol },
      },
    }));
  });

  constructor() {
    inject(AppShell).setTitle('reports');
    // Reload when the period or the branch in the top bar changes.
    effect(() => {
      this.period();
      this.session.branchId();
      untracked(() => this.load());
    });
  }

  protected load(): void {
    // TODO(you): load the report of this.period() at this.session.branchId().
    //  - before: this.status.set('loading')
    //  - success: this.report.set(report); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected exportCsv(): void {
    if (this.exporting()) return;
    // TODO(you): download the report as a CSV file (from the API, or build it from this.report()).
    //  - before: this.exporting.set(true)
    //  - after:  this.exporting.set(false); on failure, toast the error
  }
}
