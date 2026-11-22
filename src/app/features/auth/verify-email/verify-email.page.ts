import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AuthPanel } from '../../../layouts/auth-layout/auth-panel';
import { LedState } from '../auth.models';
import { ReceiptPrinter, ReceiptStamp } from '../components/receipt-printer/receipt-printer';

/**
 * Opened from the link in the verification email.
 *  - checking: waiting for the API
 *  - verified: VERIFIED stamp, "Continue to sign in"
 *  - invalid:  VOID stamp, the link expired or was already used
 */
@Component({
  selector: 'app-verify-email-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    ReceiptPrinter,
    LucideCheck,
    LucideCircleExclamationPoint,
  ],
  templateUrl: './verify-email.page.html',
  styleUrl: './verify-email.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailPage {
  private readonly transloco = inject(TranslocoService);
  private readonly language = inject(LanguageService);

  /**
   * Set by your logic.
   * TODO(you): read the token from the link (the URL), send it to the API,
   * then set 'verified' or 'invalid'.
   */
  protected readonly status = signal<'checking' | 'verified' | 'invalid'>('checking');

  protected readonly led = computed<LedState>(() => {
    const leds: Record<string, LedState> = { checking: 'wait', verified: 'ok', invalid: 'err' };
    return leds[this.status()];
  });

  protected readonly printerTitle = computed(() => {
    this.language.lang();
    return this.transloco.translate(`auth.verifyEmail.${this.status()}Printer`);
  });

  protected readonly stamp = computed<ReceiptStamp | null>(() => {
    this.language.lang();
    const t = (key: string) => this.transloco.translate(`auth.verifyEmail.${key}`);
    if (this.status() === 'verified') {
      return { word: t('verifiedStamp'), sub: t('verifiedStampSub'), placement: 'corner' };
    }
    if (this.status() === 'invalid') {
      return { word: t('void'), sub: t('voidSub'), tone: 'void', placement: 'corner' };
    }
    return null;
  });

  constructor() {
    inject(AuthPanel).show('verify');
  }
}
