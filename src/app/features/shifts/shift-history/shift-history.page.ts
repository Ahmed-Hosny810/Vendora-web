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
import { LucideHistory, LucideMonitor, LucideSearch } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { KpiCard, LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { ShiftTable } from '../components/shift-table/shift-table';
import { formatCash, shiftDiff, ShiftListItem, ShiftPeriod } from '../shifts.models';

type StateFilter = 'all' | 'open' | 'closed' | 'short';

/**
 * Shift history (/shifts): every shift at the branch picked in the top bar,
 * for a period. Managers see everyone's shifts; a cashier sees their own.
 * Linked from "Shift history" after closing a shift.
 */
@Component({
  selector: 'app-shift-history-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    KpiCard,
    ShiftTable,
    LucideHistory,
    LucideMonitor,
    LucideSearch,
  ],
  templateUrl: './shift-history.page.html',
  styleUrl: './shift-history.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/shifts/<lang>.json (keys start with "shifts.").
  providers: [provideTranslocoScope('shifts')],
})
export class ShiftHistoryPage {
  protected readonly session = inject(AppSession);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly cash = formatCash;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  /** Newest first. */
  protected readonly shifts = signal<ShiftListItem[]>([]);

  // ---------- Filters ----------
  protected readonly period = signal<ShiftPeriod>('week');
  protected readonly periods: ShiftPeriod[] = ['today', 'week', 'month'];
  protected readonly stateFilter = signal<StateFilter>('all');
  protected readonly states: StateFilter[] = ['all', 'open', 'closed', 'short'];
  /** Cashier or terminal (on the loaded list). */
  protected readonly query = signal('');

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const state = this.stateFilter();
    return this.shifts()
      .filter((s) => {
        if (state === 'open') return !s.closedAt;
        if (state === 'closed') return !!s.closedAt;
        if (state === 'short') return (shiftDiff(s) ?? 0) < 0;
        return true;
      })
      .filter(
        (s) => !q || [s.cashierName, s.terminalName].some((v) => v.toLowerCase().includes(q)),
      );
  });

  protected readonly kpis = computed(() => {
    const list = this.shifts();
    const diffs = list.map(shiftDiff).filter((d): d is number => d !== null);
    const short = diffs.filter((d) => d < 0);
    return {
      count: list.length,
      open: list.filter((s) => !s.closedAt).length,
      net: list.reduce((sum, s) => sum + s.netSales, 0),
      shortCount: short.length,
      shortTotal: Math.abs(short.reduce((sum, d) => sum + d, 0)),
    };
  });

  constructor() {
    inject(AppShell).setTitle('shifts');
    // Reload when the period or the branch in the top bar changes.
    effect(() => {
      this.period();
      this.session.branchId();
      untracked(() => this.load());
    });
  }

  protected load(): void {
    // TODO(you): load the shifts of this.period() at this.session.branchId().
    //  Cashiers: only their own shifts (the API may already do this).
    //  - before: this.status.set('loading')
    //  - success: this.shifts.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }
}
