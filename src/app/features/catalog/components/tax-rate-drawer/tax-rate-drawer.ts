import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  max,
  maxLength,
  min,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { CATALOG_LIMITS, CatalogSaveResult, TaxRate, TaxRateForm } from '../../catalog.models';

export interface TaxRateDrawerData {
  taxRate?: TaxRate;
  /** The current default's name, to warn that it stops being the default. */
  currentDefault: string | null;
  save: (value: TaxRateForm) => Promise<CatalogSaveResult>;
}

const SAMPLE = 1000;
const money = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Add or edit a tax rate, in a side drawer. Below the form, a receipt shows
 * the rate applied to a 1,000 EGP sale.
 */
@Component({
  selector: 'app-tax-rate-drawer',
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
  templateUrl: './tax-rate-drawer.html',
  styleUrls: ['../drawer.scss', './tax-rate-drawer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaxRateDrawer {
  protected readonly data = inject<TaxRateDrawerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<TaxRateForm>>(DialogRef);
  protected readonly maxName = CATALOG_LIMITS.taxName;

  protected readonly model = signal<TaxRateForm>({
    name: this.data.taxRate?.name ?? '',
    rate: this.data.taxRate?.rate ?? 0,
    isDefault: this.data.taxRate?.isDefault ?? false,
  });

  protected readonly taxForm = form(this.model, (f) => {
    validate(f.name, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.name, CATALOG_LIMITS.taxName);
    required(f.rate);
    min(f.rate, 0);
    max(f.rate, 100);
  });

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  protected readonly duplicate = signal(false);
  protected readonly saving = computed(() => this.status() === 'saving');

  protected readonly nameError = computed(() => {
    if (this.duplicate()) return 'duplicate';
    const field = this.taxForm.name();
    return field.touched() && field.invalid() ? 'nameRequired' : null;
  });
  protected readonly rateError = computed(() => {
    const field = this.taxForm.rate();
    return field.touched() && field.invalid();
  });

  /** Turning this on moves "default" away from another rate. */
  protected readonly replacesDefault = computed(
    () =>
      this.model().isDefault && !this.data.taxRate?.isDefault && this.data.currentDefault !== null,
  );

  protected readonly preview = computed(() => {
    const rate = Number(this.model().rate);
    const valid = Number.isFinite(rate) && rate >= 0 && rate <= 100;
    const tax = valid ? (SAMPLE * rate) / 100 : 0;
    return {
      subtotal: money(SAMPLE),
      rate: valid ? rate : 0,
      tax: money(tax),
      total: money(SAMPLE + tax),
    };
  });

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.duplicate.set(false);
    await submit(this.taxForm, async () => {
      this.status.set('saving');
      const result = await this.data.save(this.model());
      if (result === 'saved') {
        this.ref.close(this.model());
        return;
      }
      this.status.set(result === 'duplicate' ? 'idle' : 'failed');
      this.duplicate.set(result === 'duplicate');
    });
  }
}
