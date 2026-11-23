import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideInfo, LucidePrinter } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { KpiCard, LoadError } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { formatDateTime } from '../../../shared/utils/format';
import { CashDiff } from '../components/cash-diff/cash-diff';
import { ShiftReceipt } from '../components/shift-receipt/shift-receipt';
import {
  diffKind,
  expectedCash,
  formatCash,
  formatDuration,
  formatSigned,
  ShiftDetails,
} from '../shifts.models';

/**
 * One shift (/shifts/:id): sales, the cash drawer count and the difference,
 * other payment methods, and the printed summary (once it's closed).
 */
@Component({
  selector: 'app-shift-details-page',
  imports: [
    TranslocoDirective,
    VdButton,
    KpiCard,
    LoadError,
    CashDiff,
    ShiftReceipt,
    LucideInfo,
    LucidePrinter,
  ],
  templateUrl: './shift-details.page.html',
  styleUrl: './shift-details.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTranslocoScope('shifts')],
})
export class ShiftDetailsPage {
  protected readonly lang = inject(LanguageService).lang;
  protected readonly cash = formatCash;
  protected readonly signed = formatSigned;
  protected readonly dateTime = formatDateTime;
  /** From the URL: /shifts/<id>. */
  protected readonly shiftId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly shell = inject(AppShell);

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly shift = signal<ShiftDetails | null>(null);

  protected readonly expected = computed(() => {
    const s = this.shift();
    return s ? expectedCash(s) : 0;
  });
  /** Counted − expected; null while the shift is open. */
  protected readonly diff = computed(() => {
    const s = this.shift();
    return s && s.countedCash !== null ? s.countedCash - this.expected() : null;
  });
  protected readonly kind = computed(() => {
    const d = this.diff();
    return d === null ? null : diffKind(d);
  });
  /** "7h 40m" (closed), or how long it's been open. */
  protected readonly duration = computed(() => {
    const s = this.shift();
    return s ? formatDuration(s.openedAt, s.closedAt ?? new Date()) : '';
  });

  constructor() {
    this.shell.setPage({ key: 'pages.shift' }, [
      { key: 'nav.shifts', link: '/shifts' },
      { key: 'pages.shift' },
    ]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the shift this.shiftId.
    //  - before: this.status.set('loading')
    //  - success: this.shift.set(shift); this.status.set('ready')
    //  - not found / failure: this.status.set('error')
  }

  protected print(): void {
    window.print();
  }
}
