import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { VdButton, VdMoney } from '../../../../../shared/components/ui';
import { PricingPlan } from '../../../home.models';

/**
 * One plan: name, price, "Choose this plan" and its limits.
 *
 * @example
 * <app-pricing-card [plan]="plan" (choose)="onChoose($event)" />
 */
@Component({
  selector: 'app-pricing-card',
  imports: [TranslocoDirective, VdButton, VdMoney],
  templateUrl: './pricing-card.html',
  styleUrl: './pricing-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingCard {
  readonly plan = input.required<PricingPlan>();
  /** The user clicked "Choose this plan". Emits the plan. */
  readonly choose = output<PricingPlan>();

  /** Rows of the limits list, in order. */
  protected readonly limits = ['branches', 'terminals', 'employees'] as const;
}
