import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideExternalLink, LucideLock } from '@lucide/angular';

import { OnboardingStage } from '../../../layouts/onboarding-layout/onboarding-stage';
import { VdButton } from '../../../shared/components/ui';
import { ErrorBox } from '../components/error-box/error-box';
import { OnbHead } from '../components/onb-head/onb-head';
import { OnboardingInvoice } from '../onboarding.models';

/**
 * Step 4 of 4: the first invoice, paid on Paymob's checkout page.
 * The business already exists here, so the stepper no longer links back.
 *  - loading:     skeleton card
 *  - ready:       the invoice + Proceed to payment
 *  - redirecting: button busy while Paymob opens, with a Try again link
 *  - error:       "We couldn't load your invoice" + Try again
 */
@Component({
  selector: 'app-invoice-page',
  imports: [TranslocoDirective, VdButton, OnbHead, ErrorBox, LucideExternalLink, LucideLock],
  templateUrl: './invoice.page.html',
  styleUrl: './invoice.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicePage {
  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'redirecting' | 'error'>('loading');
  protected readonly invoice = signal<OnboardingInvoice | null>(null);

  protected readonly redirecting = computed(() => this.status() === 'redirecting');

  constructor() {
    inject(OnboardingStage).show({
      step: 3,
      caption: 'invoice',
      door: 'openingSoon',
      compact: true,
    });
    this.loadInvoice();
  }

  protected loadInvoice(): void {
    // TODO(you): load the business's first (unpaid) invoice.
    //  - before the request: this.status.set('loading')
    //  - success: this.invoice.set(invoice); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected pay(): void {
    // TODO(you): ask the API for the Paymob checkout URL, then open it.
    //  - before the request: this.status.set('redirecting')
    //  - success: window.location.href = checkoutUrl
    //    (Paymob sends the owner back to /onboarding/payment)
    //  - failure: this.status.set('ready') and show a toast
  }
}
