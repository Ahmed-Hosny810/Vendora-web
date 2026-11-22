import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideCircleExclamationPoint,
  LucidePencil,
  LucideRefreshCw,
} from '@lucide/angular';

import { OnboardingStage } from '../../../layouts/onboarding-layout/onboarding-stage';
import { VdButton } from '../../../shared/components/ui';
import { OnbHead } from '../components/onb-head/onb-head';
import { OnboardingDraft } from '../onboarding-draft';

/**
 * Step 3 of 4: check everything, then create the business.
 *  - idle:       the summary card + Create business
 *  - submitting: button busy, Back and Edit locked (no double submit)
 *  - error:      danger banner, the button becomes Try again
 */
@Component({
  selector: 'app-review-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    OnbHead,
    LucideArrowLeft,
    LucideCheck,
    LucideCircleExclamationPoint,
    LucidePencil,
    LucideRefreshCw,
  ],
  templateUrl: './review.page.html',
  styleUrl: './review.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewPage {
  protected readonly draft = inject(OnboardingDraft);
  protected readonly details = this.draft.details;
  protected readonly plan = this.draft.plan;
  protected readonly limitKeys = ['branches', 'products', 'cashiers'] as const;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'idle' | 'submitting' | 'error'>('idle');
  protected readonly busy = computed(() => this.status() === 'submitting');

  constructor() {
    inject(OnboardingStage).show({ step: 2, caption: 'review', compact: true });
  }

  protected create(): void {
    if (this.busy()) return;
    // TODO(you): create the business from this.details() and this.plan().
    //  - before the request: this.status.set('submitting')
    //  - success: go to the invoice: this.router.navigate(['/onboarding/invoice'])
    //  - failure: this.status.set('error')
  }
}
