import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideMinus, LucidePlus, LucideShoppingBag, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { findVariant, formatMoney, PosProduct, PosVariant } from '../../pos.models';

export interface VariantDialogData {
  product: PosProduct;
  /** For "6 left at Nasr City". */
  branchName: string;
  allowNegative: boolean;
}

export interface VariantDialogResult {
  variant: PosVariant;
  qty: number;
}

/**
 * "Add Linen shirt": pick each option (colour, then size), set the quantity,
 * add. Arrow keys move inside a group, Tab to the next, Enter adds, Esc cancels.
 */
@Component({
  selector: 'app-variant-dialog',
  imports: [
    TranslocoDirective,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    LucideMinus,
    LucidePlus,
    LucideShoppingBag,
    LucideX,
  ],
  templateUrl: './variant-dialog.html',
  styleUrl: './variant-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantDialog {
  protected readonly data = inject<VariantDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<VariantDialogResult>>(DialogRef);
  protected readonly money = formatMoney;
  protected readonly product = this.data.product;

  /** One value per option; starts on the first variant that can be sold. */
  protected readonly picked = signal<string[]>(
    (this.product.variants.find((v) => this.sellable(v)) ?? this.product.variants[0])?.values ?? [],
  );
  protected readonly qty = signal(1);

  protected readonly variant = computed(() => findVariant(this.product, this.picked()));
  protected readonly canAdd = computed(() => {
    const v = this.variant();
    return (
      !!v &&
      this.sellable(v) &&
      (this.data.allowNegative || v.stock === null || this.qty() <= v.stock)
    );
  });

  protected pick(index: number, value: string): void {
    this.picked.update((list) => list.map((v, i) => (i === index ? value : v)));
  }

  /**
   * A value can't be chosen when no sellable variant has it together with
   * the values picked before it (sizes sold out in this colour).
   */
  protected disabled(index: number, value: string): boolean {
    const before = this.picked().slice(0, index);
    return !this.product.variants.some(
      (v) =>
        v.values[index] === value && before.every((x, i) => v.values[i] === x) && this.sellable(v),
    );
  }

  /** "6 left" / "Sold out" under a value of the last option. */
  protected stockOf(value: string): number | null | undefined {
    const values = [...this.picked().slice(0, -1), value];
    return findVariant(this.product, values)?.stock;
  }

  protected step(by: number): void {
    this.qty.update((q) => Math.max(1, q + by));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const variant = this.variant();
    if (variant && this.canAdd()) this.ref.close({ variant, qty: this.qty() });
  }

  private sellable(v: PosVariant): boolean {
    return this.data.allowNegative || v.stock === null || v.stock > 0;
  }
}
