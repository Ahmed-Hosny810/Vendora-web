import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCheck,
  LucideCircleExclamationPoint,
  LucideLock,
  LucideRotateCcw,
} from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { FormSection, LoadError } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { formatDate } from '../../../shared/utils/format';
import { BUSINESS_TYPES } from '../../onboarding/onboarding.models';
import {
  BusinessFixedFacts,
  BusinessSettingsForm,
  SETTINGS_LIMITS,
  SettingsSaveResult,
} from '../settings.models';

const EMPTY: BusinessSettingsForm = { nameEn: '', nameAr: '', type: '', receiptFooter: '' };

/**
 * Settings → Business (/settings/business), owners and admins only.
 * Names, business type and the receipt footer, with a receipt preview.
 * Inventory tracking and currency are shown but can't be changed here.
 */
@Component({
  selector: 'app-business-settings-page',
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
  templateUrl: './business-settings.page.html',
  styleUrl: './business-settings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessSettingsPage {
  protected readonly session = inject(AppSession);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly limits = SETTINGS_LIMITS;
  protected readonly types = BUSINESS_TYPES;
  protected readonly date = formatDate;

  // ---------- Set by your logic ----------
  protected readonly loadStatus = signal<'loading' | 'ready' | 'error'>('loading');
  /** The values as last loaded or saved: "Discard changes" goes back to these. */
  protected readonly saved = signal<BusinessSettingsForm>({ ...EMPTY });
  protected readonly facts = signal<BusinessFixedFacts | null>(null);

  // ---------- The form ----------
  protected readonly model = signal<BusinessSettingsForm>({ ...EMPTY });

  protected readonly businessForm = form(this.model, (f) => {
    validate(f.nameEn, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.nameEn, SETTINGS_LIMITS.name);
    maxLength(f.nameAr, SETTINGS_LIMITS.name);
    validate(f.type, ({ value }) => (value() ? null : { kind: 'required' }));
    maxLength(f.receiptFooter, SETTINGS_LIMITS.receiptFooter);
  });

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  protected readonly saving = computed(() => this.status() === 'saving');
  /** True once something differs from what's saved. */
  protected readonly changed = computed(
    () => JSON.stringify(this.model()) !== JSON.stringify(this.saved()),
  );

  protected readonly nameEnError = computed(() => {
    const field = this.businessForm.nameEn();
    return field.touched() && field.invalid();
  });
  protected readonly typeError = computed(() => {
    const field = this.businessForm.type();
    return field.touched() && field.invalid();
  });

  constructor() {
    inject(AppShell).setPage({ key: 'nav.settings' }, [
      { key: 'nav.settings', link: '/settings' },
      { key: 'pages.settingsBusiness' },
    ]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the business settings.
    //  - before: this.loadStatus.set('loading')
    //  - success: this.saved.set(values); this.model.set({ ...values });
    //             this.facts.set({ inventory, currency, createdAt }); this.loadStatus.set('ready')
    //  - failure: this.loadStatus.set('error')
  }

  /** Puts the form back to the saved values. */
  protected discard(): void {
    this.model.set({ ...this.saved() });
    this.businessForm().reset();
    this.status.set('idle');
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;

    if (this.businessForm().invalid()) {
      const first = !this.model().nameEn.trim() ? 'bs-name-en' : 'bs-type';
      queueMicrotask(() => document.getElementById(first)?.focus());
    }

    await submit(this.businessForm, async () => {
      this.status.set('saving');
      const value = this.model();
      const trimmed: BusinessSettingsForm = {
        ...value,
        nameEn: value.nameEn.trim(),
        nameAr: value.nameAr.trim(),
        receiptFooter: value.receiptFooter.trim(),
      };
      const result = await this.save(trimmed);
      if (result === 'saved') {
        this.saved.set(trimmed);
        this.model.set({ ...trimmed });
        this.businessForm().reset();
        this.status.set('idle');
        return;
      }
      this.status.set('failed');
    });
  }

  private async save(value: BusinessSettingsForm): Promise<SettingsSaveResult> {
    // TODO(you): save the business settings, and return 'saved' or 'failed'.
    //  - success: also update the name in the top bar:
    //             this.session.business.update((b) => b && { ...b, name: value.nameEn, type: value.type })
    //             and toast "Settings saved"
    void value;
    return 'failed';
  }
}
