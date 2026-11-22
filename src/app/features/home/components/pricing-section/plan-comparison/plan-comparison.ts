import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { PricingPlan } from '../../../home.models';

/** Table of plan limits side by side. Scrolls sideways on phones. */
@Component({
  selector: 'app-plan-comparison',
  imports: [TranslocoDirective],
  templateUrl: './plan-comparison.html',
  styleUrl: './plan-comparison.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanComparison {
  readonly plans = input.required<readonly PricingPlan[]>();

  protected readonly limits = ['branches', 'terminals', 'employees'] as const;
}
