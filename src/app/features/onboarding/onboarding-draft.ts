import { Injectable, signal } from '@angular/core';

import { BusinessDetails, OnboardingPlan } from './onboarding.models';

/**
 * What the owner has entered so far, shared by every onboarding page
 * (and by the shop preview, so its sign shows the name while typing).
 *
 * It lives in memory only. TODO(you): if the owner refreshes the page,
 * decide whether to reload it from the API or from sessionStorage.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingDraft {
  /** Step 1. The business-details form edits this signal directly. */
  readonly details = signal<BusinessDetails>({
    nameEn: '',
    nameAr: '',
    type: '',
    inventory: 'track',
  });

  /** Step 2. The plan the owner chose (the whole plan, so Review can show it). */
  readonly plan = signal<OnboardingPlan | null>(null);

  /**
   * Plan id chosen on the website's pricing section, e.g. from ?plan=growth.
   * TODO(you): set it when the owner arrives from the pricing section.
   */
  readonly websitePlanId = signal<string | null>(null);
}
