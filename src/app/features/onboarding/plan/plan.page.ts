import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideCircleExclamationPoint,
  LucideInfo,
} from '@lucide/angular';

import { OnboardingStage } from '../../../layouts/onboarding-layout/onboarding-stage';
import { VdButton } from '../../../shared/components/ui';
import { ErrorBox } from '../components/error-box/error-box';
import { OnbHead } from '../components/onb-head/onb-head';
import { PlanCard } from '../components/plan-card/plan-card';
import { OnboardingDraft } from '../onboarding-draft';
import { OnboardingPlan } from '../onboarding.models';

/**
 * Step 2 of 4: choose a monthly plan.
 *  - loading: three skeleton cards, Continue disabled
 *  - ready:   plan cards. The plan picked on the website is preselected
 *             and gets a "From the website" tag and a banner.
 *  - error:   "We couldn't load the plans" + Try again
 */
@Component({
  selector: 'app-plan-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    OnbHead,
    PlanCard,
    ErrorBox,
    LucideArrowLeft,
    LucideArrowRight,
    LucideCircleExclamationPoint,
    LucideInfo,
  ],
  templateUrl: './plan.page.html',
  styleUrl: './plan.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanPage {
  protected readonly draft = inject(OnboardingDraft);

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly plans = signal<OnboardingPlan[]>([]);

  /** Continue was pressed with no plan chosen. */
  protected readonly tried = signal(false);

  protected readonly selectedId = computed(() => this.draft.plan()?.id ?? null);
  protected readonly missing = computed(() => this.tried() && !this.selectedId());

  /** The website plan, if it is in the list. */
  protected readonly websitePlan = computed(
    () => this.plans().find((plan) => plan.id === this.draft.websitePlanId()) ?? null,
  );

  constructor() {
    inject(OnboardingStage).show({ step: 1, caption: 'plan', compact: true });
    this.loadPlans();

    // When the plans arrive: preselect the website plan if nothing is chosen yet.
    effect(() => {
      const website = this.websitePlan();
      if (website && !this.draft.plan()) this.draft.plan.set(website);
    });
  }

  protected loadPlans(): void {
    // TODO(you): load the active plans from the API.
    //  - before the request: this.status.set('loading')
    //  - success: this.plans.set(plans); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected select(plan: OnboardingPlan): void {
    this.draft.plan.set(plan);
  }

  protected onContinue(): void {
    if (!this.selectedId()) {
      this.tried.set(true);
      return;
    }
    // TODO(you): go to the next step: this.router.navigate(['/onboarding/review'])
  }
}
