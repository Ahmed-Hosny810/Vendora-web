import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCheck,
  LucideCircleExclamationPoint,
  LucideLock,
  LucideRotateCcw,
} from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { FormSection, LoadError } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { initials } from '../../../shared/utils/format';
import { AccountForm, SETTINGS_LIMITS, SettingsSaveResult } from '../settings.models';

/**
 * Settings → My account (/settings/account), for everyone.
 * Name and phone can change; the email is the sign-in, so it's only shown.
 * Opened from "Profile" in the account menu too.
 */
@Component({
  selector: 'app-account-settings-page',
  imports: [
    TranslocoDirective,
    FormField,
    VdButton,
    FormSection,
    LoadError,
    LucideCheck,
    LucideCircleExclamationPoint,
    LucideLock,
    LucideRotateCcw,
  ],
  templateUrl: './account-settings.page.html',
  styleUrl: './account-settings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsPage {
  protected readonly session = inject(AppSession);
  protected readonly limits = SETTINGS_LIMITS;
  protected readonly initials = initials;

  // ---------- Set by your logic ----------
  protected readonly loadStatus = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly email = signal('');
  /** The values as last loaded or saved. */
  protected readonly saved = signal<AccountForm>({ fullName: '', phone: '' });

  // ---------- The form ----------
  protected readonly model = signal<AccountForm>({ fullName: '', phone: '' });

  protected readonly accountForm = form(this.model, (f) => {
    validate(f.fullName, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.fullName, SETTINGS_LIMITS.fullName);
    maxLength(f.phone, SETTINGS_LIMITS.phone);
  });

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  protected readonly saving = computed(() => this.status() === 'saving');
  protected readonly changed = computed(
    () => JSON.stringify(this.model()) !== JSON.stringify(this.saved()),
  );

  protected readonly nameError = computed(() => {
    const field = this.accountForm.fullName();
    return field.touched() && field.invalid();
  });

  constructor() {
    inject(AppShell).setPage({ key: 'nav.settings' }, [
      { key: 'nav.settings', link: '/settings' },
      { key: 'pages.settingsAccount' },
    ]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the signed-in user's profile.
    //  - before: this.loadStatus.set('loading')
    //  - success: this.email.set(email); this.saved.set({ fullName, phone });
    //             this.model.set({ fullName, phone }); this.loadStatus.set('ready')
    //  - failure: this.loadStatus.set('error')
  }

  protected discard(): void {
    this.model.set({ ...this.saved() });
    this.accountForm().reset();
    this.status.set('idle');
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;

    if (this.accountForm().invalid()) {
      queueMicrotask(() => document.getElementById('ac-name')?.focus());
    }

    await submit(this.accountForm, async () => {
      this.status.set('saving');
      const value: AccountForm = {
        fullName: this.model().fullName.trim(),
        phone: this.model().phone.trim(),
      };
      const result = await this.save(value);
      if (result === 'saved') {
        this.saved.set(value);
        this.model.set({ ...value });
        this.accountForm().reset();
        this.status.set('idle');
        return;
      }
      this.status.set('failed');
    });
  }

  private async save(value: AccountForm): Promise<SettingsSaveResult> {
    // TODO(you): save the profile, and return 'saved' or 'failed'.
    //  - success: update the name in the top bar:
    //             this.session.user.update((u) => u && { ...u, name: value.fullName })
    //             and toast "Profile saved"
    void value;
    return 'failed';
  }
}
