import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { form, required, submit, validate } from '@angular/forms/signals';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideCircleExclamationPoint } from '@lucide/angular';

import { UserRole } from '../../../core/session';
import { VdButton, VdWordmark } from '../../../shared/components/ui';
import { checkPassword } from '../auth.models';
import { PasswordInput } from '../components/password-input/password-input';
import { PasswordRules } from '../components/password-rules/password-rules';

/**
 * First sign-in (/first-sign-in): an invited employee signed in with the
 * temporary details from their email and now chooses their own password.
 * Then they go to the area their role can use (cashiers → the POS).
 */
@Component({
  selector: 'app-first-sign-in-page',
  imports: [
    TranslocoDirective,
    VdButton,
    VdWordmark,
    PasswordInput,
    PasswordRules,
    LucideCircleExclamationPoint,
  ],
  templateUrl: './first-sign-in.page.html',
  styleUrl: './first-sign-in.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Outside the auth layout, so the page loads the auth texts itself.
  providers: [provideTranslocoScope('auth')],
})
export class FirstSignInPage {
  // ---------- Set by your logic (from the signed-in user) ----------
  protected readonly firstName = signal('');
  protected readonly businessName = signal('');
  protected readonly role = signal<UserRole>('cashier');
  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');

  protected readonly model = signal({ password: '', confirm: '' });

  protected readonly passwordForm = form(this.model, (f) => {
    required(f.password);
    validate(f.password, ({ value }) =>
      Object.values(checkPassword(value())).every(Boolean) ? null : { kind: 'rules' },
    );
    required(f.confirm);
    validate(f.confirm, ({ value, valueOf }) =>
      value() && value() !== valueOf(f.password) ? { kind: 'mismatch' } : null,
    );
  });

  /** Keys under auth.register.errors (same texts as sign-up and reset). */
  protected readonly errors = computed(() => {
    const shown = (field: { touched(): boolean; invalid(): boolean }) =>
      field.touched() && field.invalid();
    const password = this.passwordForm.password();
    const confirm = this.passwordForm.confirm();
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
  protected readonly saving = computed(() => this.status() === 'saving');

  /** Where they go next, for the line under the button. */
  protected readonly nextKey = computed(() =>
    this.role() === 'cashier'
      ? 'nextPos'
      : this.role() === 'inventoryStaff'
        ? 'nextStock'
        : 'nextOverview',
  );

  constructor() {
    // TODO(you): fill firstName, businessName and role from the signed-in user.
    //  If they already chose a password, send them on to their area instead.
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    await submit(this.passwordForm, async () => {
      // TODO(you): save this.model().password.
      //  - before: this.status.set('saving')
      //  - success: go to the role's area (cashier → POS, inventory staff → /inventory, admin → /overview)
      //  - failure: this.status.set('failed')
    });
  }
}
