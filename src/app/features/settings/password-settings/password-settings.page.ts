import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, required, submit, validate } from '@angular/forms/signals';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleCheck, LucideCircleExclamationPoint } from '@lucide/angular';

import { AppShell } from '../../../layouts/app-layout/app-shell';
import { FormSection } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { checkPassword } from '../../auth/auth.models';
import { PasswordInput } from '../../auth/components/password-input/password-input';
import { PasswordRules } from '../../auth/components/password-rules/password-rules';
import { PasswordForm, PasswordSaveResult } from '../settings.models';

const EMPTY: PasswordForm = { current: '', next: '', confirm: '' };

/**
 * Settings → Password (/settings/password), for everyone.
 * Current password, then the new one twice. The new one follows the same
 * rules as sign-up. Opened from "Change password" in the account menu too.
 */
@Component({
  selector: 'app-password-settings-page',
  imports: [
    TranslocoDirective,
    VdButton,
    FormSection,
    PasswordInput,
    PasswordRules,
    LucideCheck,
    LucideCircleCheck,
    LucideCircleExclamationPoint,
  ],
  templateUrl: './password-settings.page.html',
  styleUrl: './password-settings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The password box and the rules list read their words from the auth files.
  providers: [provideTranslocoScope('auth')],
})
export class PasswordSettingsPage {
  protected readonly model = signal<PasswordForm>({ ...EMPTY });

  protected readonly passwordForm = form(this.model, (f) => {
    required(f.current);
    required(f.next);
    validate(f.next, ({ value }) =>
      Object.values(checkPassword(value())).every(Boolean) ? null : { kind: 'rules' },
    );
    validate(f.next, ({ value, valueOf }) =>
      value() && value() === valueOf(f.current) ? { kind: 'same' } : null,
    );
    required(f.confirm);
    validate(f.confirm, ({ value, valueOf }) =>
      value() && value() !== valueOf(f.next) ? { kind: 'mismatch' } : null,
    );
  });

  /** 'saved' shows the green note; 'wrongCurrent' marks the first box. */
  protected readonly status = signal<'idle' | 'saving' | 'saved' | 'wrongCurrent' | 'failed'>(
    'idle',
  );
  protected readonly saving = computed(() => this.status() === 'saving');

  protected readonly checks = computed(() => checkPassword(this.model().next));

  protected readonly errors = computed(() => {
    const shown = (field: { touched(): boolean; invalid(): boolean }) =>
      field.touched() && field.invalid();
    const current = this.passwordForm.current();
    const next = this.passwordForm.next();
    const confirm = this.passwordForm.confirm();
    return {
      current:
        this.status() === 'wrongCurrent'
          ? 'wrongCurrent'
          : shown(current)
            ? 'currentRequired'
            : null,
      next: shown(next)
        ? next.errors()[0]?.kind === 'required'
          ? 'nextRequired'
          : next.errors()[0]?.kind === 'same'
            ? 'same'
            : 'rules'
        : null,
      confirm: shown(confirm)
        ? confirm.errors()[0]?.kind === 'required'
          ? 'confirmRequired'
          : 'mismatch'
        : null,
    };
  });

  /** The rules list shows once a new password was tried and doesn't meet them. */
  protected readonly showRules = computed(() => this.errors().next === 'rules');

  constructor() {
    inject(AppShell).setPage({ key: 'nav.settings' }, [
      { key: 'nav.settings', link: '/settings' },
      { key: 'pages.settingsPassword' },
    ]);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    if (this.status() !== 'idle') this.status.set('idle');

    if (this.passwordForm().invalid()) {
      const e = this.errors();
      const first =
        !this.model().current || e.current
          ? 'pw-current'
          : e.next || !this.model().next
            ? 'pw-next'
            : 'pw-confirm';
      queueMicrotask(() => document.getElementById(first)?.focus());
    }

    await submit(this.passwordForm, async () => {
      this.status.set('saving');
      const { current, next } = this.model();
      const result = await this.save(current, next);
      if (result === 'saved') {
        this.model.set({ ...EMPTY });
        this.passwordForm().reset();
      }
      this.status.set(result);
      if (result === 'wrongCurrent') {
        queueMicrotask(() => document.getElementById('pw-current')?.focus());
      }
    });
  }

  private async save(current: string, next: string): Promise<PasswordSaveResult> {
    // TODO(you): change the password, and return the result:
    //  - success:                    'saved'
    //  - the current one was wrong:  'wrongCurrent'
    //  - anything else:              'failed'
    void current;
    void next;
    return 'failed';
  }
}
