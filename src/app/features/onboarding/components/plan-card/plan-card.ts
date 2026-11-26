import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideGlobe } from '@lucide/angular';

import { OnboardingPlan } from '../../onboarding.models';

/**
 * One plan as a big radio card: name, monthly price, description and limits.
 * Put several inside a <fieldset> that has a legend.
 *
 * @example
 * <app-plan-card [plan]="plan" [checked]="plan.id === selectedId()" (pick)="select(plan)" />
 */
@Component({
  selector: 'app-plan-card',
  imports: [TranslocoDirective, LucideGlobe],
  templateUrl: './plan-card.html',
  styleUrl: './plan-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanCard {
  readonly plan = input.required<OnboardingPlan>();
  readonly checked = input(false);
  /** Adds the "From the website" tag (the plan picked on the pricing section). */
  readonly fromWebsite = input(false, { transform: booleanAttribute });
  /** Radio group name, shared by all the cards. */
  readonly name = input('plan');
  readonly pick = output<OnboardingPlan>();

  protected readonly limitKeys = ['branches', 'products', 'cashiers'] as const;
}
