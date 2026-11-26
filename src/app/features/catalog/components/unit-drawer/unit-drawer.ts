import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { CATALOG_LIMITS, CatalogSaveResult, Unit, UnitForm } from '../../catalog.models';

export interface UnitDrawerData {
  unit?: Unit;
  save: (value: UnitForm) => Promise<CatalogSaveResult>;
}

/**
 * Add or edit a unit, in a side drawer. A little scale shows what
 * "fractions allowed" means (0.5 kg vs 1 pc).
 */
@Component({
  selector: 'app-unit-drawer',
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
  templateUrl: './unit-drawer.html',
  styleUrls: ['../drawer.scss', './unit-drawer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitDrawer {
  protected readonly data = inject<UnitDrawerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<UnitForm>>(DialogRef);
  protected readonly limits = CATALOG_LIMITS;

  protected readonly model = signal<UnitForm>({
    name: this.data.unit?.name ?? '',
    symbol: this.data.unit?.symbol ?? '',
    allowFractions: this.data.unit?.allowFractions ?? false,
  });

  protected readonly unitForm = form(this.model, (f) => {
    validate(f.name, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.name, CATALOG_LIMITS.unitName);
    validate(f.symbol, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.symbol, CATALOG_LIMITS.unitSymbol);
  });

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  /** The symbol is already used by another unit. */
  protected readonly duplicate = signal(false);
  protected readonly saving = computed(() => this.status() === 'saving');

  protected readonly nameError = computed(() => {
    const field = this.unitForm.name();
    return field.touched() && field.invalid();
  });
  protected readonly symbolError = computed(() => {
    if (this.duplicate()) return 'symbolTaken';
    const field = this.unitForm.symbol();
    return field.touched() && field.invalid() ? 'symbolRequired' : null;
  });

  /** What the scale shows: "0.5 kg" with fractions, "1 pc" without. */
  protected readonly reading = computed(() => {
    const symbol = this.model().symbol.trim() || 'kg';
    return `${this.model().allowFractions ? '0.5' : '1'} ${symbol}`;
  });

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.duplicate.set(false);
    await submit(this.unitForm, async () => {
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
