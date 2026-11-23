import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideShoppingBag } from '@lucide/angular';

import { formatMoney } from '../../products.models';

/**
 * How the product looks as a card on the POS: picture (or a striped
 * placeholder), names and price. Decorative.
 */
@Component({
  selector: 'app-product-card-preview',
  imports: [TranslocoDirective, LucideShoppingBag],
  template: `
    <ng-container *transloco="let t; read: 'products.form'">
      <span class="img" [class.img--ph]="!imageUrl()">
        @if (imageUrl(); as url) {
          <img [src]="url" alt="" />
        } @else {
          <svg lucideShoppingBag></svg>
        }
      </span>
      <b lang="en" dir="ltr">{{ nameEn().trim() || t('namePlaceholder') }}</b>
      @if (nameAr().trim()) {
        <span class="ar" lang="ar" dir="rtl">{{ nameAr() }}</span>
      }
      <span class="pr" dir="ltr"
        >{{ priceText() }} <small>{{ t('egp') }}</small></span
      >
    </ng-container>
  `,
  styleUrl: './product-card-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class ProductCardPreview {
  readonly nameEn = input('');
  readonly nameAr = input('');
  readonly price = input(0);
  readonly imageUrl = input<string | null>(null);

  protected readonly priceText = computed(() => formatMoney(Number(this.price()) || 0));
}
