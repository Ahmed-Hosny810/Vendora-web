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
  LucideArrowRight,
  LucideCheck,
  LucideHourglass,
  LucideReceiptText,
  LucideRefreshCw,
  LucideSparkles,
  LucideX,
} from '@lucide/angular';

import { OnboardingStage, StageOptions } from '../../../layouts/onboarding-layout/onboarding-stage';
import { VdButton } from '../../../shared/components/ui';
import { OnbHead } from '../components/onb-head/onb-head';
import { MiniStep, StepsMini } from '../components/steps-mini/steps-mini';
import { OnboardingDraft } from '../onboarding-draft';
import { PaymentStatus } from '../onboarding.models';

/** The small progress list for each status (keys under onboarding.status.steps). */
const MINI: Record<PaymentStatus, MiniStep[]> = {
  waiting: [
    { key: 'created', state: 'done' },
    { key: 'back', state: 'done' },
    { key: 'waiting', state: 'now' },
    { key: 'activate', state: 'todo' },
  ],
  failed: [
    { key: 'created', state: 'done' },
    { key: 'notCompleted', state: 'todo' },
  ],
  activating: [
    { key: 'created', state: 'done' },
    { key: 'received', state: 'done' },
    { key: 'activating', state: 'now' },
  ],
  active: [
    { key: 'created', state: 'done' },
    { key: 'received', state: 'done' },
    { key: 'active', state: 'done' },
  ],
};

/** The shop beside the text, for each status. */
const SCENE: Record<PaymentStatus, StageOptions> = {
  waiting: { step: 3, caption: 'waiting', mood: 'wait', door: 'openingSoon' },
  failed: { step: 3, caption: 'failed', mood: 'off', door: 'closed' },
  activating: { step: 3, caption: 'activating', mood: 'light', door: 'openingSoon' },
  active: { step: 3, caption: 'active', mood: 'open', door: 'open', confetti: true },
};

/**
 * Where Paymob sends the owner back. Never shows success just because
 * the owner returned: it waits for the payment to be confirmed.
 *  - waiting:    hourglass, moving bar, "Check again"
 *  - failed:     "Payment wasn't completed" + Return to invoice
 *  - activating: payment confirmed, workspace being set up
 *  - active:     "You're open for business" + Set up my business
 */
@Component({
  selector: 'app-payment-status-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    OnbHead,
    StepsMini,
    LucideArrowRight,
    LucideCheck,
    LucideHourglass,
    LucideReceiptText,
    LucideRefreshCw,
    LucideSparkles,
    LucideX,
  ],
  templateUrl: './payment-status.page.html',
  styleUrl: './payment-status.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStatusPage {
  protected readonly draft = inject(OnboardingDraft);
  private readonly stage = inject(OnboardingStage);

  // ---------- Set by your logic ----------
  protected readonly status = signal<PaymentStatus>('waiting');
  /** True while a "Check again" request is running. */
  protected readonly checking = signal(false);

  protected readonly mini = computed(() => MINI[this.status()]);

  constructor() {
    // The shop follows the status: blinking bulbs, lights off, lights on, open.
    effect(() => this.stage.show(SCENE[this.status()]));

    // TODO(you): ask the API for the payment status now, then every few seconds
    //  while it is 'waiting' or 'activating' (stop when the page is destroyed).
    //  Map the answer to this.status.set('waiting' | 'failed' | 'activating' | 'active').
  }

  protected checkAgain(): void {
    // TODO(you): ask the API for the payment status right away.
    //  - before: this.checking.set(true); after: this.checking.set(false)
  }
}
