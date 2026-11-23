import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { formatMoney } from '../../products.models';

/**
 * Live shelf tag for the product form: a butter price tag that sways,
 * with the category, names, price, a barcode and the codes.
 * Under it, the margin (only when `cost` is given: owners and managers).
 * Decorative: everything on it is typed in the form beside it.
 */
@Component({
  selector: 'app-shelf-tag',
  imports: [TranslocoDirective],
  templateUrl: './shelf-tag.html',
  styleUrl: './shelf-tag.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class ShelfTag {
  readonly category = input('');
  readonly nameEn = input('');
  readonly nameAr = input('');
  readonly price = input(0);
  readonly sku = input('');
  readonly barcode = input('');
  /** Leave null to hide the margin line. */
  readonly cost = input<number | null>(null);

  protected readonly priceText = computed(() => formatMoney(Number(this.price()) || 0));
  /** (price − cost) ÷ price, e.g. "48.5%". */
  protected readonly margin = computed(() => {
    const price = Number(this.price());
    const cost = this.cost();
    if (cost === null || !price) return '—';
    return (((price - Number(cost)) / price) * 100).toFixed(1) + '%';
  });
}
