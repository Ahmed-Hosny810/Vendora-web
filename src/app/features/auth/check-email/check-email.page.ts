import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LucideCheck, LucideMail, LucideMinus } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AuthPanel } from '../../../layouts/auth-layout/auth-panel';
import { ReceiptPrinter, ReceiptStamp } from '../components/receipt-printer/receipt-printer';

/** After registering: "We sent a verification link to …". */
@Component({
  selector: 'app-check-email-page',
  imports: [RouterLink, TranslocoDirective, ReceiptPrinter, LucideCheck, LucideMail, LucideMinus],
  templateUrl: './check-email.page.html',
  styleUrl: './check-email.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckEmailPage {
  private readonly transloco = inject(TranslocoService);
  private readonly language = inject(LanguageService);

  /**
   * The address the link was sent to. Empty = a general sentence without it.
   * TODO(you): fill it, e.g. from the register page (router state or a service).
   */
  protected readonly email = signal('');

  /** The three steps; only the first is done. */
  protected readonly steps = [
    { key: 'created', done: true },
    { key: 'open', done: false },
    { key: 'setup', done: false },
  ];

  protected readonly stamp = computed<ReceiptStamp>(() => {
    this.language.lang(); // re-run when the language changes
    return {
      word: this.transloco.translate('auth.checkEmail.stampWord'),
      sub: this.transloco.translate('auth.checkEmail.stampSub'),
      placement: 'corner',
    };
  });

  constructor() {
    inject(AuthPanel).show('verify');
  }
}
