import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideBanknote,
  LucideCircleExclamationPoint,
  LucideCreditCard,
  LucideTriangleExclamationPoint,
} from '@lucide/angular';

import { SectionHeading } from '../../../../shared/components/marketing/section-heading/section-heading';

/**
 * "Why Vendora": four numbered benefits. The heading stays in place
 * (sticky) on wide screens while the list scrolls beside it.
 */
@Component({
  selector: 'app-benefits-section',
  imports: [
    TranslocoDirective,
    SectionHeading,
    LucideBanknote,
    LucideCircleExclamationPoint,
    LucideCreditCard,
    LucideTriangleExclamationPoint,
  ],
  templateUrl: './benefits-section.html',
  styleUrl: './benefits-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefitsSection {
  /** Order of the rows. Text: home.benefits.<key>.title / .text */
  protected readonly rows = ['checkout', 'stock', 'people', 'cash'] as const;
}
