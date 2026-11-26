import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * A money amount: "1,284.50 EGP" in English, "1,284.50 ج.م" in Arabic.
 * Digits stay Latin in both languages (as in the designs), with equal-width
 * digits so totals line up. Size comes from the parent or a type class.
 *
 * @example
 * <vd-money [amount]="item.price" />
 * <vd-money class="figure-lg" [amount]="total()" />
 */
@Component({
  selector: 'vd-money',
  imports: [TranslocoPipe],
  template: `
    <bdi class="amount" dir="ltr">{{ formatted() }}</bdi>
    <small class="currency">{{ 'currency.' + currency() | transloco }}</small>
  `,
  styleUrl: './money.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.negative]': 'amount() < 0' },
})
export class VdMoney {
  readonly amount = input.required<number>();
  /** Key in public/i18n/*.json → currency.<code>. */
  readonly currency = input('EGP');
  readonly fractionDigits = input(2);

  // 'en-US' on purpose: Latin digits and "1,234.50" in both languages.
  private readonly formatter = computed(
    () =>
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: this.fractionDigits(),
        maximumFractionDigits: this.fractionDigits(),
      }),
  );

  protected readonly formatted = computed(() => this.formatter().format(this.amount()));
}
