import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArrowLeft,
  LucideCircleCheck,
  LucideCircleExclamationPoint,
  LucideMinus,
  LucidePlus,
  LucidePrinter,
  LucideUndo2,
} from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { LoadError } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { ReturnReceiptSlip } from '../components/return-receipt/return-receipt';
import {
  formatLongDate,
  formatMoney,
  RETURN_REASONS,
  ReturnableLine,
  ReturnableSale,
  ReturnForm,
  ReturnReason,
  ReturnReceipt,
  ReturnStatus,
  round2,
} from '../pos.models';

/**
 * Return items (/pos/return/:id): pick what comes back from a sale, why,
 * and where the money goes. Ends with a printed return slip.
 * Refunds need an open shift on this terminal (cash comes out of its drawer).
 */
@Component({
  selector: 'app-sale-return-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    LoadError,
    ReturnReceiptSlip,
    LucideArrowLeft,
    LucideCircleCheck,
    LucideCircleExclamationPoint,
    LucideMinus,
    LucidePlus,
    LucidePrinter,
    LucideUndo2,
  ],
  templateUrl: './sale-return.page.html',
  styleUrl: './sale-return.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleReturnPage {
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly longDate = formatLongDate;
  protected readonly reasons = RETURN_REASONS;
  /** From the URL: /pos/return/<sale id>. */
  protected readonly saleId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly sale = signal<ReturnableSale | null>(null);
  /** The printed slip, once the return is done. */
  protected readonly slip = signal<ReturnReceipt | null>(null);

  // ---------- The form ----------
  /** Quantity coming back, per line id. Starts at 0 for every line. */
  protected readonly qty = linkedSignal<Record<string, number>>(() =>
    Object.fromEntries((this.sale()?.lines ?? []).map((l) => [l.id, 0])),
  );
  protected readonly reason = signal<ReturnReason | ''>('');
  protected readonly note = signal('');
  protected readonly restock = signal(true);
  /** Refund the way they paid: the first cash payment, else the first payment. */
  protected readonly methodId = linkedSignal(() => {
    const payments = this.sale()?.payments ?? [];
    return (payments.find((p) => p.isCash) ?? payments[0])?.methodId ?? '';
  });
  /** One entry per method (a sale paid in two cash payments shows "Cash" once). */
  protected readonly methods = computed(() => {
    const seen = new Map<string, { methodId: string; name: string; paid: number }>();
    for (const p of this.sale()?.payments ?? []) {
      const m = seen.get(p.methodId);
      if (m) m.paid += p.amount;
      else seen.set(p.methodId, { methodId: p.methodId, name: p.name, paid: p.amount });
    }
    return [...seen.values()];
  });

  protected readonly submitStatus = signal<'idle' | 'saving' | 'failed' | 'noShift'>('idle');
  /** Set on the first Refund press: errors show from then on. */
  protected readonly tried = signal(false);

  protected readonly chosen = computed(() =>
    (this.sale()?.lines ?? [])
      .map((line) => ({ line, qty: this.qty()[line.id] ?? 0 }))
      .filter((x) => x.qty > 0),
  );
  protected readonly itemCount = computed(() => this.chosen().reduce((s, x) => s + x.qty, 0));
  protected readonly refund = computed(() =>
    round2(this.chosen().reduce((s, x) => s + x.qty * x.line.unitRefund, 0)),
  );
  /** What's left to return on every line: "Return everything" is off when nothing is. */
  protected readonly anyLeft = computed(() =>
    (this.sale()?.lines ?? []).some((l) => this.left(l) > 0),
  );

  protected readonly errors = computed(() => {
    if (!this.tried()) return { items: false, reason: false, note: false };
    return {
      items: this.itemCount() === 0,
      reason: !this.reason(),
      note: this.reason() === 'other' && !this.note().trim(),
    };
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    // TODO(you): load the sale this.saleId with what can still be returned.
    //  - before: this.status.set('loading')
    //  - success: this.sale.set(sale); this.status.set('ready')
    //  - not found / failure: this.status.set('error')
  }

  /** How much of a line can still come back. */
  protected left(line: ReturnableLine): number {
    return round2(line.qtySold - line.qtyReturned);
  }

  protected step(line: ReturnableLine, by: number): void {
    const next = Math.min(this.left(line), Math.max(0, (this.qty()[line.id] ?? 0) + by));
    this.qty.update((q) => ({ ...q, [line.id]: round2(next) }));
  }

  protected all(): void {
    const lines = this.sale()?.lines ?? [];
    this.qty.set(Object.fromEntries(lines.map((l) => [l.id, this.left(l)])));
  }

  protected async submit(): Promise<void> {
    if (this.submitStatus() === 'saving') return;
    this.tried.set(true);
    const e = this.errors();
    if (e.items || e.reason || e.note) return;

    const form: ReturnForm = {
      lines: this.chosen().map((x) => ({ lineId: x.line.id, qty: x.qty })),
      reason: this.reason() as ReturnReason,
      note: this.note().trim(),
      refundMethodId: this.methodId(),
      restock: this.restock(),
    };
    this.submitStatus.set('saving');
    const result = await this.save(form);
    this.submitStatus.set(result === 'done' ? 'idle' : result);
  }

  private async save(form: ReturnForm): Promise<ReturnStatus> {
    // TODO(you): send the return, and return the result:
    //  - success: this.slip.set(slip) (the server's return slip), then 'done'
    //  - no open shift on this terminal: 'noShift'
    //  - anything else: 'failed'
    void form;
    return 'failed';
  }

  protected print(): void {
    window.print();
  }
}
