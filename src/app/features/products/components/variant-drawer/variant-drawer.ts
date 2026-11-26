import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  maxLength,
  min,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { PRODUCT_LIMITS, ProductSaveResult, Variant, VariantForm } from '../../products.models';

export interface VariantDrawerData {
  productName: string;
  /** Starting prices for a new variant (the product's). */
  defaults: { price: number; cost: number; sku: string };
  /** Cost is only shown to owners and managers. */
  showCost: boolean;
  variant?: Variant;
  save: (value: VariantForm) => Promise<ProductSaveResult>;
}

/**
 * Add or edit one variant, in a side drawer. Each variant is added on its own:
 * a name the cashier sees, up to two options (e.g. Color: Black, Size: Large),
 * its own prices and codes.
 */
@Component({
  selector: 'app-variant-drawer',
  imports: [
    TranslocoDirective,
    FormField,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    LucideCheck,
    LucideCircleExclamationPoint,
    LucideX,
  ],
  templateUrl: './variant-drawer.html',
  styleUrl: './variant-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantDrawer {
  protected readonly data = inject<VariantDrawerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<VariantForm>>(DialogRef);
  protected readonly limits = PRODUCT_LIMITS;

  protected readonly model = signal<VariantForm>({
    name: this.data.variant?.name ?? '',
    option1Name: this.data.variant?.option1Name ?? '',
    option1Value: this.data.variant?.option1Value ?? '',
    option2Name: this.data.variant?.option2Name ?? '',
    option2Value: this.data.variant?.option2Value ?? '',
    price: this.data.variant?.price ?? this.data.defaults.price,
    cost: this.data.variant?.cost ?? this.data.defaults.cost,
    sku: this.data.variant?.sku ?? '',
    barcode: this.data.variant?.barcode ?? '',
  });

  protected readonly variantForm = form(this.model, (f) => {
    validate(f.name, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.name, PRODUCT_LIMITS.name);
    required(f.price);
    min(f.price, 0);
    required(f.cost);
    min(f.cost, 0);
    maxLength(f.sku, PRODUCT_LIMITS.sku);
    maxLength(f.barcode, PRODUCT_LIMITS.barcode);
  });

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  /** SKU or barcode already used. */
  protected readonly duplicate = signal(false);
  protected readonly saving = computed(() => this.status() === 'saving');

  protected invalid(field: 'name' | 'price' | 'cost'): boolean {
    const state = this.variantForm[field]();
    return state.touched() && state.invalid();
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.duplicate.set(false);
    await submit(this.variantForm, async () => {
      this.status.set('saving');
      const result = await this.data.save(this.model());
      if (result === 'saved') {
        this.ref.close(this.model());
        return;
      }
      this.status.set(result === 'failed' ? 'failed' : 'idle');
      this.duplicate.set(result === 'duplicate');
    });
  }
}
