import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { formatMoney, formatReceiptDate, ReturnReceipt } from '../../pos.models';

/**
 * The printed return slip: what came back, the original receipt, and the
 * refund, stamped "REFUNDED". Same paper as the sale receipt.
 */
@Component({
  selector: 'app-return-receipt',
  imports: [TranslocoDirective],
  templateUrl: './return-receipt.html',
  styleUrl: './return-receipt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Printing the page prints only this.
  host: { class: 'vd-print' },
})
export class ReturnReceiptSlip {
  readonly receipt = input.required<ReturnReceipt>();

  protected readonly money = formatMoney;
  protected readonly date = formatReceiptDate;
}
