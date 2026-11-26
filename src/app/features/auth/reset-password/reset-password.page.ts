import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, required, submit, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LucideCircleExclamationPoint, LucideLock } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AuthPanel } from '../../../layouts/auth-layout/auth-panel';
import { checkPassword, LedState } from '../auth.models';
import { PasswordInput } from '../components/password-input/password-input';
import { PasswordRules } from '../components/password-rules/password-rules';
import { ReceiptPrinter, ReceiptStamp } from '../components/receipt-printer/receipt-printer';

/**
 * Opened from the link in the reset email.
 *  - idle:       new password + confirm
 *  - submitting: saving; form locked
 *  - success:    UPDATED stamp, "Back to sign in"
 *  - invalid:    VOID stamp, the link expired or was already used
 */
@Component({
  selector: 'app-reset-password-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    ReceiptPrinter,
    PasswordInput,
    PasswordRules,
    LucideCircleExclamationPoint,
    LucideLock,
  ],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage {
  private readonly transloco = inject(TranslocoService);
  private readonly language = inject(LanguageService);

  protected readonly model = signal({ password: '', confirm: '' });

  protected readonly resetForm = form(this.model, (f) => {
    required(f.password);
    validate(f.password, ({ value }) =>
      Object.values(checkPassword(value())).every(Boolean) ? null : { kind: 'rules' },
    );
    required(f.confirm);
    validate(f.confirm, ({ value, valueOf }) =>
      value() && value() !== valueOf(f.password) ? { kind: 'mismatch' } : null,
    );
  });

  /**
   * Set by your logic.
   * TODO(you): read the token (and email) from the link. If the token is
   * already known to be bad, set 'invalid' right away.
   */
  protected readonly status = signal<'idle' | 'submitting' | 'success' | 'invalid'>('idle');
  /** Shown on the slip: "PASSWORD RESET · For nour@bayt.eg". Empty = no email shown. */
  protected readonly email = signal('');

  protected readonly errors = computed(() => {
    const shown = (field: { touched(): boolean; invalid(): boolean }) =>
      field.touched() && field.invalid();
    const password = this.resetForm.password();
    const confirm = this.resetForm.confirm();
    return {
      password: shown(password)
        ? password.errors()[0]?.kind === 'required'
          ? 'passwordRequired'
          : 'passwordRules'
        : null,
      confirm: shown(confirm)
        ? confirm.errors()[0]?.kind === 'required'
          ? 'confirmRequired'
          : 'mismatch'
        : null,
    };
  });

  protected readonly checks = computed(() => checkPassword(this.model().password));
  protected readonly showRules = computed(() => this.errors().password === 'passwordRules');
  protected readonly busy = computed(() => this.status() === 'submitting');

  protected readonly led = computed<LedState>(() => {
    const status = this.status();
    if (status === 'success') return 'ok';
    if (status === 'invalid' || this.errors().password || this.errors().confirm) return 'err';
    return 'wait';
  });

  protected readonly printerTitle = computed(() => {
    this.language.lang();
    const keys = {
      idle: 'printing',
      submitting: 'saving',
      success: 'successPrinter',
      invalid: 'invalidPrinter',
    };
    return this.transloco.translate(`auth.reset.${keys[this.status()]}`);
  });

  protected readonly stamp = computed<ReceiptStamp | null>(() => {
    this.language.lang();
    const t = (key: string) => this.transloco.translate(key);
    if (this.status() === 'success') {
      return {
        word: t('auth.reset.stampWord'),
        sub: t('auth.reset.stampSub'),
        placement: 'corner',
      };
    }
    if (this.status() === 'invalid') {
      return {
        word: t('auth.verifyEmail.void'),
        sub: t('auth.verifyEmail.voidSub'),
        tone: 'void',
        placement: 'corner',
      };
    }
    return null;
  });

  constructor() {
    inject(AuthPanel).show('reset');
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy()) return;

    await submit(this.resetForm, async () => {
      // TODO(you): save this.model().password with the token from the link.
      //  - before the request: this.status.set('submitting')
      //  - token expired/used: this.status.set('invalid')
      //  - success:            this.status.set('success')
    });
  }
}
