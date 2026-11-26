import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { ShopFront } from '../../../../features/onboarding/components/shop-front/shop-front';
import { BusinessDetails } from '../../../../features/onboarding/onboarding.models';
import { StageScene } from '../../onboarding-stage';

/**
 * The butter panel beside the form: dots, floating price tags, the shop,
 * and a caption. On tablets and phones it moves above the form and the
 * caption hides.
 */
@Component({
  selector: 'app-scene-panel',
  imports: [TranslocoDirective, ShopFront],
  templateUrl: './scene-panel.html',
  styleUrl: './scene-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.compact]': 'scene().compact',
    '[class.wide]': 'wide()',
  },
})
export class ScenePanel {
  readonly scene = input.required<StageScene>();
  readonly details = input.required<BusinessDetails>();
  /** Welcome page: the shop is drawn a bit smaller. */
  readonly wide = input(false);

  /** Falling tags: left %, delay s, width px. */
  protected readonly confetti = [
    [8, 0, 26],
    [22, 0.7, 20],
    [37, 1.5, 30],
    [52, 0.3, 22],
    [66, 1.1, 28],
    [80, 1.9, 20],
    [92, 0.5, 24],
    [15, 2.4, 22],
    [72, 2.8, 26],
  ] as const;

  protected readonly tagPath = 'M9 1.5h15a2.5 2.5 0 0 1 2.5 2.5v14a2.5 2.5 0 0 1-2.5 2.5H9L1.5 11z';
}
