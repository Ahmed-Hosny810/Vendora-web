import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, pattern, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideArrowLeft, LucideCircleExclamationPoint, LucideSend } from '@lucide/angular';

import { AuthPanel } from '../../../layouts/auth-layout/auth-panel';
import { VdButton } from '../../../shared/components/ui';
import { EMAIL_PATTERN, LedState } from '../auth.models';
import { CardTerminal } from '../components/card-terminal/card-terminal';

/**
 * Forgot password: ask for the email, then show a neutral "check your inbox"
 * (it never says whether the account exists).
 *  - idle:       the form
 *  - submitting: button busy, form locked
 *  - sent:       "Check your inbox"
 */
@Component({
  selector: 'app-forgot-password-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    FormField,
    VdButton,
    CardTerminal,
    LucideArrowLeft,
    LucideCircleExclamationPoint,
    LucideSend,
  ],
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  protected readonly model = signal({ email: '' });

  protected readonly forgotForm = form(this.model, (f) => {
    required(f.email);
    pattern(f.email, EMAIL_PATTERN);
  });

  protected readonly emailError = computed(() => {
    const field = this.forgotForm.email();
    if (!field.touched() || !field.invalid()) return null;
    return field.errors()[0].kind === 'required' ? 'emailRequired' : 'emailInvalid';
  });

  /** Set by your logic. */
  protected readonly status = signal<'idle' | 'submitting' | 'sent'>('idle');
  protected readonly busy = computed(() => this.status() === 'submitting');

  protected readonly led = computed<LedState>(() =>
    this.busy() ? 'wait' : this.emailError() ? 'err' : 'ok',
  );
  protected readonly shakes = signal(0);

  constructor() {
    inject(AuthPanel).show('forgot');
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy()) return;
    if (this.forgotForm().invalid()) this.shakes.update((n) => n + 1);

    await submit(this.forgotForm, async () => {
      // TODO(you): ask the API to send a reset link to this.model().email.
      //  - before the request: this.status.set('submitting')
      //  - when it answers (whatever it says): this.status.set('sent')
    });
  }
}
