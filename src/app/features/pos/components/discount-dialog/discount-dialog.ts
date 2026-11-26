import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideShield, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { CartLine, Discount, formatMoney, lineTotals, round2, saleTotals } from '../../pos.models';

export interface DiscountDialogData {
  lines: CartLine[];
  saleDiscount: Discount | null;
  /** The most this cashier may give, in % (10 for 10%). null = no limit. */
  maxPercent: number | null;
}

/** 'sale' for the whole sale, or the line's key. */
export interface DiscountDialogResult {
  target: string;
  discount: Discount;
}

interface DiscountModel {
  target: 'sale' | 'item';
  lineKey: string;
  type: 'percent' | 'amount';
  value: number;
  reason: string;
}

/** Apply a discount to the whole sale or one line, with a reason. Shows the new total. */
@Component({
  selector: 'app-discount-dialog',
  imports: [
    TranslocoDirective,
    FormField,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    LucideCheck,
    LucideCircleExclamationPoint,
    LucideShield,
    LucideX,
  ],
  templateUrl: './discount-dialog.html',
  styleUrl: './discount-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountDialog {
  protected readonly data = inject<DiscountDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<DiscountDialogResult>>(DialogRef);
  protected readonly money = formatMoney;

  protected readonly model = signal<DiscountModel>({
    target: 'sale',
    lineKey: this.data.lines[0]?.key ?? '',
    type: 'percent',
    value: 0,
    reason: '',
  });

  /** What the discount applies to, after line discounts. */
  protected readonly base = computed(() => {
    const m = this.model();
    if (m.target === 'item') {
      const line = this.data.lines.find((l) => l.key === m.lineKey);
      return line ? lineTotals({ ...line, discount: null }).gross : 0;
    }
    return round2(this.data.lines.reduce((s, l) => s + lineTotals(l).net, 0));
  });

  protected readonly saleBase = computed(() =>
    round2(this.data.lines.reduce((s, l) => s + lineTotals(l).gross, 0)),
  );

  /** The highest value allowed for the chosen type. */
  protected readonly maxValue = computed(() => {
    const max = this.data.maxPercent ?? 100;
    return this.model().type === 'percent' ? max : round2((this.base() * max) / 100);
  });

  protected readonly discountForm = form(this.model, (f) => {
    validate(f.value, ({ value }) => {
      const v = value();
      if (!(v > 0)) return { kind: 'min' };
      return v > this.maxValue() ? { kind: 'max' } : null;
    });
    validate(f.reason, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.reason, 200);
  });

  protected readonly valueError = computed(() => {
    const field = this.discountForm.value();
    if (!field.touched() || field.valid()) return null;
    return field.errors()[0]?.kind === 'max' ? 'max' : 'min';
  });
  protected readonly reasonError = computed(() => {
    const field = this.discountForm.reason();
    return field.touched() && field.invalid();
  });

  /** "1,672.15 EGP −88.01": the total with this discount. */
  protected readonly preview = computed(() => {
    const m = this.model();
    const before = saleTotals(this.data.lines, this.data.saleDiscount).total;
    if (!(m.value > 0)) return null;
    const discount: Discount = { type: m.type, value: m.value, reason: m.reason };
    const after =
      m.target === 'sale'
        ? saleTotals(this.data.lines, discount).total
        : saleTotals(
            this.data.lines.map((l) => (l.key === m.lineKey ? { ...l, discount } : l)),
            this.data.saleDiscount,
          ).total;
    return { total: after, change: round2(after - before) };
  });

  protected setType(type: 'percent' | 'amount'): void {
    this.model.update((m) => ({ ...m, type }));
  }

  protected setTarget(target: 'sale' | 'item'): void {
    this.model.update((m) => ({ ...m, target }));
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.discountForm, async () => {
      const m = this.model();
      this.ref.close({
        target: m.target === 'sale' ? 'sale' : m.lineKey,
        discount: { type: m.type, value: m.value, reason: m.reason.trim() },
      });
    });
  }
}
