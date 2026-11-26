import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

/**
 * A small storefront for a branch: sign with its names, striped awning,
 * the city in the window, and a MAIN ribbon on the door for the main branch.
 * Decorative: the same facts are in the form or details beside it.
 *
 * @example
 * <app-branch-shop nameEn="Nasr City" nameAr="مدينة نصر" city="Cairo" main />
 */
@Component({
  selector: 'app-branch-shop',
  imports: [TranslocoDirective],
  templateUrl: './branch-shop.html',
  styleUrl: './branch-shop.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class BranchShop {
  readonly nameEn = input('');
  readonly nameAr = input('');
  readonly city = input('');
  readonly main = input(false, { transform: booleanAttribute });
}
