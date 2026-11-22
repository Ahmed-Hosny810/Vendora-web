import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideInfo } from '@lucide/angular';

import { SectionHeading } from '../../../../shared/components/marketing/section-heading/section-heading';
import { BillingOption, PricingPlan } from '../../home.models';
import { PlanComparison } from './plan-comparison/plan-comparison';
import { PricingCard } from './pricing-card/pricing-card';

/**
 * Pricing: plan cards and a comparison table.
 *
 * Shows whatever plans it receives. While `loading` is true it shows grey
 * placeholder cards. The billing switch (monthly / yearly…) only appears
 * when there is more than one billing option.
 *
 * @example
 * <app-pricing-section
 *   [plans]="plans()"
 *   [loading]="loading()"
 *   [billingOptions]="billingOptions()"
 *   [selectedBilling]="billing()"
 *   (billingChange)="billing.set($event)"
 *   (planChosen)="choosePlan($event)"
 * />
 */
@Component({
  selector: 'app-pricing-section',
  imports: [TranslocoDirective, SectionHeading, PricingCard, PlanComparison, LucideInfo],
  templateUrl: './pricing-section.html',
  styleUrl: './pricing-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingSection {
  readonly plans = input<readonly PricingPlan[]>([]);
  readonly loading = input(false);
  readonly billingOptions = input<readonly BillingOption[]>([]);
  /** Id of the selected billing option. */
  readonly selectedBilling = input<string | null>(null);

  /** The user picked another billing option. Emits its id. */
  readonly billingChange = output<string>();
  /** The user clicked "Choose this plan" on a card. */
  readonly planChosen = output<PricingPlan>();

  /** Three grey cards while loading. */
  protected readonly placeholders = [1, 2, 3];
}
