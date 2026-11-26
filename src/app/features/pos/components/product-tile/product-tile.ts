import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideShoppingBag } from '@lucide/angular';

import { findVariant, formatMoney, PosProduct, PosVariant } from '../../pos.models';

/**
 * A product on the POS grid, shaped like a price tag.
 * - No variants: the whole tile is one button that adds it.
 * - Variants: pick the first options on the tile (colour dots), then tap the last
 *   option (size) to add that variant. Tapping the picture or name opens the full picker.
 */
@Component({
  selector: 'app-product-tile',
  imports: [NgTemplateOutlet, TranslocoDirective, LucideShoppingBag],
  templateUrl: './product-tile.html',
  styleUrl: './product-tile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTile {
  readonly product = input.required<PosProduct>();
  /** Let cashiers sell items the system shows as sold out. */
  readonly allowNegative = input(false);

  /** Add this product (variant null) or one of its variants. */
  readonly add = output<PosVariant | null>();
  /** Open the full option picker. */
  readonly choose = output<void>();

  protected readonly money = formatMoney;

  protected readonly hasVariants = computed(() => this.product().options.length > 0);
  /** Every option but the last is picked on the tile (colour). */
  protected readonly pickers = computed(() => this.product().options.slice(0, -1));
  /** The last option adds on tap (size). */
  protected readonly last = computed(() => this.product().options.at(-1) ?? null);

  /** The values picked on the tile, starting with each option's first value. */
  protected readonly picked = linkedSignal(() =>
    this.pickers().map((o) => o.values[0]?.value ?? ''),
  );

  /** Nothing left to sell (and selling below zero isn't allowed). */
  protected readonly soldOut = computed(() => {
    if (this.allowNegative()) return false;
    const p = this.product();
    if (p.variants.length) return p.variants.every((v) => v.stock !== null && v.stock <= 0);
    return p.stock !== null && p.stock <= 0;
  });

  /** The variant a size button would add, with the tile's picks. */
  protected variantFor(value: string): PosVariant | undefined {
    return findVariant(this.product(), [...this.picked(), value]);
  }

  protected canAdd(variant: PosVariant | undefined): boolean {
    if (!variant) return false;
    return this.allowNegative() || variant.stock === null || variant.stock > 0;
  }

  protected pick(index: number, value: string): void {
    this.picked.update((list) => list.map((v, i) => (i === index ? value : v)));
  }
}
