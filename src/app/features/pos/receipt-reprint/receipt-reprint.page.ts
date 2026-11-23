import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LucidePrinter, LucideUndo2 } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError, PageHead } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { SaleReceipt } from '../components/sale-receipt/sale-receipt';
import { formatLongDate, formatMoney, Receipt } from '../pos.models';

/**
 * A past receipt (/sales/:id/receipt) and "Print copy". A reprint is an exact
 * copy: marked COPY / REPRINT, never changing prices, payments or the number.
 */
@Component({
  selector: 'app-receipt-reprint-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    LoadError,
    PageHead,
    SaleReceipt,
    LucidePrinter,
    LucideUndo2,
  ],
  templateUrl: './receipt-reprint.page.html',
  styleUrl: './receipt-reprint.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/pos/<lang>.json (keys start with "pos.").
  providers: [provideTranslocoScope('pos')],
})
export class ReceiptReprintPage {
  private readonly shell = inject(AppShell);
  private readonly transloco = inject(TranslocoService);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly longDate = formatLongDate;

  protected readonly saleId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly receipt = signal<Receipt | null>(null);
  /** When this copy was printed (shown on the paper). */
  protected readonly reprintedAt = signal<Date>(new Date());
  protected readonly printStatus = signal<'idle' | 'saving'>('idle');

  /** "Cash 2,000.00 · change 239.84" */
  protected readonly paymentLine = computed(() => {
    const r = this.receipt();
    if (!r) return '';
    const parts = r.payments.map((p) => `${p.name} ${formatMoney(p.amount)}`);
    if (r.change)
      parts.push(this.transloco.translate('pos.reprint.change', { amount: formatMoney(r.change) }));
    return parts.join(' · ');
  });

  constructor() {
    // Top bar: "Sales › R-NASR-000128".
    effect(() => {
      const number = this.receipt()?.number;
      this.shell.setPage({ key: 'pages.receipt' }, [
        { key: 'nav.sales', link: '/sales' },
        number ? { text: number } : { key: 'pages.receipt' },
      ]);
    });
    this.load();
  }

  protected load(): void {
    // TODO(you): load the receipt of sale this.saleId.
    //  - before: this.status.set('loading')
    //  - success: this.receipt.set(receipt); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected async printCopy(): Promise<void> {
    if (this.printStatus() === 'saving') return;
    // TODO(you): record the reprint (who and when) before printing.
    //  - before: this.printStatus.set('saving')
    //  - success: this.reprintedAt.set(printedAt); this.printStatus.set('idle')
    //  - failure: this.printStatus.set('idle'); toast the error and don't print
    this.reprintedAt.set(new Date());
    // Only the receipt is printed (it has class vd-print).
    setTimeout(() => window.print());
  }
}
