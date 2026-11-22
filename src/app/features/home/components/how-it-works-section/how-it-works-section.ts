import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleCheck,
  LucideClock,
  LucideDynamicIcon,
  LucideReceipt,
  LucideStore,
} from '@lucide/angular';

import { SectionHeading } from '../../../../shared/components/marketing/section-heading/section-heading';

/** Four numbered steps from sign-up to the first sale. */
@Component({
  selector: 'app-how-it-works-section',
  imports: [TranslocoDirective, LucideDynamicIcon, SectionHeading],
  templateUrl: './how-it-works-section.html',
  styleUrl: './how-it-works-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorksSection {
  /** Text: home.how.<key>.title / .text / .chip */
  protected readonly steps = [
    { key: 'account', icon: LucideCircleCheck },
    { key: 'plan', icon: LucideReceipt },
    { key: 'setup', icon: LucideStore },
    { key: 'sell', icon: LucideClock },
  ];
}
