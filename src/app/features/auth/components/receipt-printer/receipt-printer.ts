import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LedState } from '../../auth.models';
import { StatusLeds } from '../status-leds/status-leds';

/** A rubber stamp pressed on the receipt, e.g. APPROVED / Account created. */
export interface ReceiptStamp {
  word: string;
  sub: string;
  /** Green ink (default) or red "void" ink. */
  tone?: 'ok' | 'void';
  /** Big in the middle (default) or smaller in the top corner. */
  placement?: 'center' | 'corner';
}

/**
 * A receipt printer: dark printer on top, a paper receipt coming out of it.
 * Content inside the tag is printed on the paper.
 *
 * @example
 * <app-receipt-printer [title]="'Printing your account…'" led="wait" [stamp]="stamp()">
 *   <form>…</form>
 * </app-receipt-printer>
 */
@Component({
  selector: 'app-receipt-printer',
  imports: [StatusLeds],
  templateUrl: './receipt-printer.html',
  styleUrl: './receipt-printer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptPrinter {
  /** Small text on the printer, e.g. "Printing your account…". */
  readonly title = input.required<string>();
  readonly led = input<LedState>('wait');
  /** Shown on the paper when set. */
  readonly stamp = input<ReceiptStamp | null>(null);
}
