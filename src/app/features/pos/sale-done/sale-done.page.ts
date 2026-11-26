import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCheck,
  LucideCircleCheck,
  LucidePrinter,
  LucideReceiptText,
  LucideRefreshCw,
  LucideTriangleAlert,
} from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { LanguageService } from '../../../core/i18n';
import { LoadError } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { SaleReceipt } from '../components/sale-receipt/sale-receipt';
import { PosCart } from '../pos-cart';
import { formatLongDate, formatMoney, Receipt } from '../pos.models';

/**
 * After checkout (/pos/sale/:id).
 * - Done: "Sale complete", the change to give, and the receipt printing.
 * - Attention: the payment is saved but the receipt wasn't issued; try again
 *   or start a new sale (this one stays in Sales for a manager).
 * Enter starts the next sale.
 */
@Component({
  selector: 'app-sale-done-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    LoadError,
    SaleReceipt,
    LucideCheck,
    LucideCircleCheck,
    LucidePrinter,
    LucideReceiptText,
    LucideRefreshCw,
    LucideTriangleAlert,
  ],
  templateUrl: './sale-done.page.html',
  styleUrl: './sale-done.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/pos/<lang>.json (keys start with "pos.").
  providers: [provideTranslocoScope('pos')],
  host: { '(document:keydown.enter)': 'onEnter($event)' },
})
export class SaleDonePage {
  private readonly router = inject(Router);
  private readonly cart = inject(PosCart);
  protected readonly session = inject(AppSession);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly longDate = formatLongDate;

  protected readonly saleId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  /** The issued receipt; null while it isn't issued (needs attention). */
  protected readonly receipt = signal<Receipt | null>(null);
  /** What was paid, for "Payment of 1,760.16 EGP is safe". */
  protected readonly paidTotal = signal(0);
  protected readonly retryStatus = signal<'idle' | 'retrying' | 'failed'>('idle');

  /** Change to give, sent by checkout (or from the receipt). */
  protected readonly change = computed(
    () => this.receipt()?.change ?? (history.state?.change as number | undefined) ?? 0,
  );
  protected readonly attention = computed(() => this.status() === 'ready' && !this.receipt());

  constructor() {
    this.load();
  }

  protected load(): void {
    // TODO(you): load the sale this.saleId.
    //  - before: this.status.set('loading')
    //  - receipt issued: this.receipt.set(receipt); this.status.set('ready')
    //  - paid but no receipt yet: this.receipt.set(null); this.paidTotal.set(total); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected onEnter(event: Event): void {
    // Only when nothing else (a button, a field) has the focus.
    if ((event.target as HTMLElement) !== document.body || this.attention()) return;
    event.preventDefault();
    this.startNew();
  }

  protected startNew(): void {
    this.cart.reset();
    this.router.navigate(['/pos']);
  }

  /** Prints only the receipt (it has class vd-print). */
  protected print(): void {
    window.print();
  }

  protected retry(): void {
    // TODO(you): try issuing the receipt again.
    //  - before: this.retryStatus.set('retrying')
    //  - success: this.receipt.set(receipt); this.retryStatus.set('idle')
    //  - failure: this.retryStatus.set('failed')
  }
}
