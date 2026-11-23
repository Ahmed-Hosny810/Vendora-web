import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { formatLongDate, formatMoney, formatReceiptDate, Receipt } from '../../pos.models';

/**
 * The printed receipt: zig-zag paper, monospace lines, a barcode and a stamp
 * (PAID, REPRINT, or PENDING on a receipt that wasn't issued yet).
 * Printing the page prints only this (class vd-print).
 */
@Component({
  selector: 'app-sale-receipt',
  imports: [TranslocoDirective],
  templateUrl: './sale-receipt.html',
  styleUrl: './sale-receipt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'vd-print', '[class.is-pending]': '!receipt()' },
})
export class SaleReceipt {
  /** null: not issued yet (a faded "PENDING" slip). */
  readonly receipt = input<Receipt | null>(null);
  /** Shown when there's no receipt yet. */
  readonly businessName = input('');
  readonly stamp = input<'paid' | 'reprint' | null>('paid');
  /** A reprint: "COPY OF ORIGINAL RECEIPT · Reprinted …" on top. */
  readonly reprintedAt = input<Date | null>(null);
  readonly lang = input('en');

  protected readonly money = formatMoney;
  protected readonly date = formatReceiptDate;
  protected readonly longDate = formatLongDate;
}
