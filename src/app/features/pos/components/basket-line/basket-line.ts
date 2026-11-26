import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleExclamationPoint,
  LucideMinus,
  LucidePlus,
  LucideTrash2,
} from '@lucide/angular';

import { VdIconButton } from '../../../../shared/components/ui';
import { CartLine, discountLabel, formatMoney, lineTotals, overStock } from '../../pos.models';

/**
 * One line in the basket: name, "White / Medium · 650.00 × 1", the line total
 * (old total crossed out when discounted), a − qty + stepper, the discount and a bin.
 * More than is left shows an error under it.
 */
@Component({
  selector: 'app-basket-line',
  imports: [
    TranslocoDirective,
    VdIconButton,
    LucideCircleExclamationPoint,
    LucideMinus,
    LucidePlus,
    LucideTrash2,
  ],
  templateUrl: './basket-line.html',
  styleUrl: './basket-line.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-err]': 'tooMany()' },
})
export class BasketLine {
  readonly line = input.required<CartLine>();
  /** For "Only 1 left at Nasr City". */
  readonly branchName = input('');

  /** The new quantity (0 never comes: removing uses `remove`). */
  readonly qtyChange = output<number>();
  readonly remove = output<void>();

  protected readonly money = formatMoney;
  protected readonly totals = computed(() => lineTotals(this.line()));
  protected readonly tooMany = computed(() => overStock(this.line()));
  /** "−10%" (the reason follows it in the template). */
  protected readonly badge = computed(() => {
    const d = this.line().discount;
    return d ? discountLabel(d) : '';
  });

  protected step(by: number): void {
    const qty = this.line().qty + by;
    if (qty < 1) this.remove.emit();
    else this.qtyChange.emit(qty);
  }
}
