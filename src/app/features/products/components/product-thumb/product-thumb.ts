import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideShoppingBag } from '@lucide/angular';

/**
 * A product's small square picture, or a dashed placeholder bag
 * when it has none.
 *
 * @example
 * <app-product-thumb [src]="p.imageUrl" [alt]="p.nameEn" size="lg" />
 */
@Component({
  selector: 'app-product-thumb',
  imports: [LucideShoppingBag],
  template: `
    @if (src(); as url) {
      <img [src]="url" [alt]="alt()" loading="lazy" />
    } @else {
      <svg lucideShoppingBag aria-hidden="true"></svg>
    }
  `,
  styles: `
    :host {
      display: grid;
      flex: none;
      place-items: center;
      width: 44px;
      height: 44px;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--paper-100);
      color: var(--ink-500);
    }
    :host(.ph) {
      border-style: dashed;
    }
    :host(.lg) {
      width: 56px;
      height: 56px;
      border-radius: 14px;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    svg {
      width: 18px;
      height: 18px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ph]': '!src()',
    '[class.lg]': "size() === 'lg'",
  },
})
export class ProductThumb {
  readonly src = input<string | null>(null);
  readonly alt = input('');
  readonly size = input<'md' | 'lg'>('md');
}
