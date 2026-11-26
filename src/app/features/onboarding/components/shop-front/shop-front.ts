import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideArrowLeft, LucideLayers } from '@lucide/angular';

import { BusinessType } from '../../onboarding.models';
import { ShopScene } from '../shop-scene/shop-scene';

/** How lit the shop looks. */
export type ShopMood = 'idle' | 'wait' | 'off' | 'light' | 'open';
/** The little sign hanging on the door. */
export type DoorSign = 'comingSoon' | 'openingSoon' | 'closed' | 'open';

/**
 * The storefront drawing: sign with the business name, bulbs, striped awning,
 * a window showing the business type, and a door sign.
 * Decorative only (aria-hidden): every fact it shows is also in the form.
 *
 * @example
 * <app-shop-front nameEn="Nour Boutique" type="clothing" mood="open" door="open" />
 * <app-shop-front live … />   ← shutter down until a type is picked, then rolls up
 */
@Component({
  selector: 'app-shop-front',
  imports: [TranslocoDirective, ShopScene, LucideArrowLeft, LucideLayers],
  templateUrl: './shop-front.html',
  styleUrl: './shop-front.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class ShopFront {
  readonly nameEn = input('');
  readonly nameAr = input('');
  readonly type = input<BusinessType | ''>('');
  readonly trackInventory = input(true);
  readonly mood = input<ShopMood>('idle');
  readonly door = input<DoorSign>('comingSoon');
  /** Business-details page: show the shutter until a type is chosen. */
  readonly live = input(false, { transform: booleanAttribute });

  protected readonly bulbs = Array.from({ length: 9 }, (_, i) => i);
  protected readonly enName = computed(() => this.nameEn().trim());
  protected readonly arName = computed(() => this.nameAr().trim());
}
