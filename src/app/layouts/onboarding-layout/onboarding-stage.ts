import { Injectable, signal } from '@angular/core';

import { DoorSign, ShopMood } from '../../features/onboarding/components/shop-front/shop-front';

/** Which caption the scene panel shows under the shop. */
export type SceneCaption =
  | 'details'
  | 'plan'
  | 'review'
  | 'invoice'
  | 'waiting'
  | 'failed'
  | 'activating'
  | 'active'
  | 'welcome';

export interface StageScene {
  caption: SceneCaption;
  mood: ShopMood;
  door: DoorSign;
  /** Smaller shop on phones, so the form starts higher. */
  compact: boolean;
  /** Price tags falling (subscription active). */
  confetti: boolean;
  /** Shutter until a business type is picked (business details only). */
  live: boolean;
}

export interface StageOptions extends Partial<StageScene> {
  caption: SceneCaption;
  /** Stepper position 0–3, or null to hide the stepper (welcome page). */
  step: number | null;
  /** Wide form column, narrow scene (welcome page). */
  wide?: boolean;
}

/**
 * Lets each onboarding page set the stepper and the shop scene beside it.
 * Provided by OnboardingLayout, so all its pages share one copy.
 *
 * @example
 * // in a page:
 * constructor() { inject(OnboardingStage).show({ step: 1, caption: 'plan', compact: true }); }
 */
@Injectable()
export class OnboardingStage {
  readonly step = signal<number | null>(0);
  readonly wide = signal(false);
  readonly scene = signal<StageScene>({
    caption: 'details',
    mood: 'idle',
    door: 'comingSoon',
    compact: false,
    confetti: false,
    live: false,
  });

  show({ step, wide = false, ...scene }: StageOptions): void {
    this.step.set(step);
    this.wide.set(wide);
    this.scene.set({
      mood: 'idle',
      door: 'comingSoon',
      compact: false,
      confetti: false,
      live: false,
      ...scene,
    });
  }
}
