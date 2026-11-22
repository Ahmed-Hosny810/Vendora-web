import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { form, FormField, maxLength, required, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArrowRight,
  LucideCircleExclamationPoint,
  LucideLock,
  LucideStore,
} from '@lucide/angular';

import { OnboardingStage } from '../../../layouts/onboarding-layout/onboarding-stage';
import { VdButton } from '../../../shared/components/ui';
import { OnbHead } from '../components/onb-head/onb-head';
import { OnboardingDraft } from '../onboarding-draft';
import { BUSINESS_TYPES, NAME_MAX_LENGTH } from '../onboarding.models';

/**
 * Step 1 of 4: business names, type, currency (locked) and inventory tracking.
 * The form edits the shared draft directly, so the shop sign beside it
 * shows the name while the owner types, and the window opens on a type pick.
 */
@Component({
  selector: 'app-business-details-page',
  imports: [
    TranslocoDirective,
    FormField,
    VdButton,
    OnbHead,
    LucideArrowRight,
    LucideCircleExclamationPoint,
    LucideLock,
    LucideStore,
  ],
  templateUrl: './business-details.page.html',
  styleUrl: './business-details.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessDetailsPage {
  private readonly draft = inject(OnboardingDraft);

  protected readonly types = BUSINESS_TYPES;
  protected readonly maxLength = NAME_MAX_LENGTH;
  protected readonly model = this.draft.details;

  protected readonly detailsForm = form(this.model, (f) => {
    // Spaces only don't count as a name.
    validate(f.nameEn, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    // Also sets maxlength on the inputs, so typing stops at the limit.
    maxLength(f.nameEn, NAME_MAX_LENGTH);
    maxLength(f.nameAr, NAME_MAX_LENGTH);
    required(f.type);
  });

  protected readonly nameEnError = computed(() => {
    const field = this.detailsForm.nameEn();
    return field.touched() && field.invalid();
  });
  protected readonly typeError = computed(() => {
    const field = this.detailsForm.type();
    return field.touched() && field.invalid();
  });

  constructor() {
    inject(OnboardingStage).show({ step: 0, caption: 'details', live: true });
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.detailsForm().invalid()) {
      // submit() below marks every field touched, so the errors appear.
      // Move focus to the first field that needs fixing.
      const first = this.model().nameEn.trim() ? 'btype' : 'name-en';
      queueMicrotask(() => document.getElementById(first)?.focus());
    }

    await submit(this.detailsForm, async () => {
      // TODO(you): the details are already in OnboardingDraft.details.
      //  Go to the next step: this.router.navigate(['/onboarding/plan'])
    });
  }
}
