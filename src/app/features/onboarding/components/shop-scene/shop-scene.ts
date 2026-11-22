import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { BusinessType } from '../../onboarding.models';

/**
 * The animated drawing inside the shop window, one per business type.
 * Purely decorative: the parent hides it from screen readers.
 *
 * @example
 * <app-shop-scene type="clothing" />
 */
@Component({
  selector: 'app-shop-scene',
  templateUrl: './shop-scene.html',
  styleUrl: './shop-scene.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopScene {
  readonly type = input.required<BusinessType>();
}
