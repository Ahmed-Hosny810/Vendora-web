import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { form, FormField, maxLength, submit, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArrowLeft,
  LucideChevronRight,
  LucideCircleExclamationPoint,
  LucideClock,
  LucideHistory,
  LucideLock,
  LucideLogOut,
  LucidePrinter,
  LucideTriangleAlert,
} from '@lucide/angular';

import { PosShell } from '../../../layouts/pos-layout/pos-shell';
import { LoadError } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { CashDiff } from '../components/cash-diff/cash-diff';
import { ShiftReceipt } from '../components/shift-receipt/shift-receipt';
import {
  CloseShiftForm,
  diffKind,
  expectedCash,
  formatCash,
  formatSigned,
  formatTime,
  round2,
  ShiftBlocker,
  ShiftSummary,
} from '../shifts.models';

/**
 * Close shift (/pos/shift/close): review the totals, count the drawer,
 * close. Unfinished sales block it first. After closing, a read-only
 * summary with the printed shift receipt.
 */
@Component({
  selector: 'app-shift-close-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    FormField,
    VdButton,
    LoadError,
    CashDiff,
    ShiftReceipt,
    LucideArrowLeft,
    LucideChevronRight,
    LucideCircleExclamationPoint,
    LucideClock,
    LucideHistory,
    LucideLock,
    LucideLogOut,
    LucidePrinter,
    LucideTriangleAlert,
  ],
  templateUrl: './shift-close.page.html',
  styleUrl: './shift-close.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/shifts/<lang>.json (keys start with "shifts.").
  providers: [provideTranslocoScope('shifts')],
})
export class ShiftClosePage {
  private readonly pos = inject(PosShell);
  protected readonly cash = formatCash;
  protected readonly signed = formatSigned;
  protected readonly time = formatTime;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  /** The open shift's totals; null when there's no open shift. */
  protected readonly summary = signal<ShiftSummary | null>(null);
  /** Unfinished operations: closing waits until there are none. */
  protected readonly blockers = signal<ShiftBlocker[]>([]);
  protected readonly closeStatus = signal<'idle' | 'closing' | 'failed'>('idle');
  /** Set when the shift is closed: shows the read-only summary. */
  protected readonly closedAt = signal<Date | null>(null);

  protected readonly model = signal<CloseShiftForm>({ countedCash: 0, note: '' });

  protected readonly closeForm = form(this.model, (f) => {
    validate(f.countedCash, ({ value }) => (value() >= 0 ? null : { kind: 'min' }));
    maxLength(f.note, 500);
  });

  protected readonly closing = computed(() => this.closeStatus() === 'closing');
  protected readonly expected = computed(() => {
    const s = this.summary();
    return s ? expectedCash(s) : 0;
  });
  protected readonly diff = computed(() => round2(this.model().countedCash - this.expected()));
  protected readonly kind = computed(() => diffKind(this.diff()));
  protected readonly absDiff = computed(() => Math.abs(this.diff()));
  /** The difference shows once the cashier starts typing the count. */
  protected readonly counted = computed(() => this.closeForm.countedCash().dirty());
  protected readonly countError = computed(() => {
    const field = this.closeForm.countedCash();
    return field.touched() && field.invalid();
  });

  constructor() {
    // The POS bar shows the terminal and the shift (light bar once closed).
    effect(() => {
      const s = this.summary();
      this.pos.terminalName.set(s?.terminalName ?? null);
      this.pos.shift.set(s ? { openedAt: s.openedAt, closed: !!this.closedAt() } : null);
    });
    this.load();
  }

  protected load(): void {
    // TODO(you): load the current shift's summary and what still blocks closing.
    //  - before: this.status.set('loading')
    //  - success: this.summary.set(summary or null); this.blockers.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.closing()) return;
    this.closeForm.countedCash().markAsDirty();
    await submit(this.closeForm, async () => {
      // TODO(you): close the shift with this.model() (trim the note).
      //  - before: this.closeStatus.set('closing')
      //  - success: this.closeStatus.set('idle'); this.closedAt.set(closedAt)
      //  - something still unfinished: reload the blockers (this.load())
      //  - other failure: this.closeStatus.set('failed')
    });
    if (this.countError()) document.getElementById('sc-count')?.focus();
  }

  /** Prints only the shift receipt (it has class vd-print). */
  protected print(): void {
    window.print();
  }

  protected signOut(): void {
    // TODO(you): sign out.
  }
}
