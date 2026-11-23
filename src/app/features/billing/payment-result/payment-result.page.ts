import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleCheck,
  LucideCircleX,
  LucideExternalLink,
  LucideFileText,
  LucideLoaderCircle,
} from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { VdButton } from '../../../shared/components/ui';
import { formatDate, formatMoney } from '../../../shared/utils/format';

/** What Paymob's return tells us, once your logic has checked it with the API. */
export type RenewalPaymentStatus = 'checking' | 'paid' | 'failed';

/** The invoice the owner just tried to pay. */
export interface PaidInvoiceInfo {
  id: string;
  number: string;
  amount: number;
  /** The paid period ends on this day (shown when paid). */
  paidUntil: Date;
}

/**
 * Back from Paymob after paying a Vendora invoice (/billing/payment).
 * Checking → paid (with the new end date) or failed (try again).
 * The onboarding has its own payment page; this one is for renewals and
 * any later invoice paid from Billing.
 */
@Component({
  selector: 'app-payment-result-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    LucideCircleCheck,
    LucideCircleX,
    LucideExternalLink,
    LucideFileText,
    LucideLoaderCircle,
  ],
  templateUrl: './payment-result.page.html',
  styleUrl: './payment-result.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTranslocoScope('billing')],
})
export class PaymentResultPage {
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly date = formatDate;

  // ---------- Set by your logic ----------
  protected readonly status = signal<RenewalPaymentStatus>('checking');
  protected readonly invoice = signal<PaidInvoiceInfo | null>(null);
  /** "Try again" is opening Paymob. */
  protected readonly retrying = signal(false);

  constructor() {
    inject(AppShell).setPage({ key: 'pages.payment' }, [
      { key: 'nav.billing', link: '/billing' },
      { key: 'pages.payment' },
    ]);
    // TODO(you): read Paymob's return (query params), ask the API for the result, then:
    //  this.invoice.set({ id, number, amount, paidUntil }) and
    //  this.status.set('paid') or this.status.set('failed').
    //  While the API still says "pending", keep 'checking' and ask again every few seconds.
    //  On paid: also update the subscription in AppSession if you keep it there.
  }

  protected retry(): void {
    if (this.retrying()) return;
    // TODO(you): get a new Paymob link for this.invoice()!.id and open it
    //  (window.location.href = url).
    //  - before: this.retrying.set(true)
    //  - failure: this.retrying.set(false) and toast the error
  }
}
