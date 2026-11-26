import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideChartColumn,
  LucideCheck,
  LucideDynamicIcon,
  LucidePercent,
  LucideSearch,
  LucideTriangleExclamationPoint,
} from '@lucide/angular';

import { InView } from '../../../../../shared/directives/in-view';
import { BRANCH_BARS, DEMO_PAYMENTS, DEMO_PRODUCTS } from '../../../home.data';

/**
 * The animated point-of-sale picture in the hero: a terminal ringing up a
 * sale, a branch summary, a printed receipt and a low-stock alert.
 *
 * Pure CSS animation. It waits until the picture is on screen (InView adds
 * the "is-in-view" class to this element). To replay it, the parent creates
 * a fresh copy of this component.
 */
@Component({
  selector: 'app-pos-demo',
  imports: [
    TranslocoDirective,
    LucideDynamicIcon,
    LucideChartColumn,
    LucideCheck,
    LucidePercent,
    LucideSearch,
    LucideTriangleExclamationPoint,
  ],
  templateUrl: './pos-demo.html',
  styleUrl: './pos-demo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [InView],
})
export class PosDemo {
  protected readonly products = DEMO_PRODUCTS;
  protected readonly branches = BRANCH_BARS;
  protected readonly payments = DEMO_PAYMENTS;
}
