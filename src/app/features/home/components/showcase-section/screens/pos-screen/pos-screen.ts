import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideDynamicIcon, LucidePercent, LucideSearch } from '@lucide/angular';

import { DEMO_PAYMENTS, DEMO_PRODUCTS } from '../../../../home.data';

/**
 * Picture of the point-of-sale screen for the "See it work" tabs.
 * The parent gives it role="img" and an aria-label describing it.
 */
@Component({
  selector: 'app-pos-screen',
  imports: [TranslocoDirective, LucideDynamicIcon, LucideCheck, LucidePercent, LucideSearch],
  templateUrl: './pos-screen.html',
  styleUrl: './pos-screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PosScreen {
  protected readonly products = DEMO_PRODUCTS;
  protected readonly payments = DEMO_PAYMENTS;
}
