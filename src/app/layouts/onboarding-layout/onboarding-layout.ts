import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';

import { AppLang, LanguageService } from '../../core/i18n';
import { OnboardingDraft } from '../../features/onboarding/onboarding-draft';
import { OnboardingBar } from './components/onboarding-bar/onboarding-bar';
import { ScenePanel } from './components/scene-panel/scene-panel';
import { OnboardingStage } from './onboarding-stage';

/**
 * Frame for business onboarding: top bar with the stepper, the page (form)
 * on one side and the shop preview on the other. On tablets and phones
 * the shop moves above the form.
 */
@Component({
  selector: 'app-onboarding-layout',
  imports: [RouterOutlet, TranslocoDirective, OnboardingBar, ScenePanel],
  templateUrl: './onboarding-layout.html',
  styleUrl: './onboarding-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    OnboardingStage,
    // Loads public/i18n/onboarding/<lang>.json for the layout and every page.
    // Its keys start with "onboarding.", e.g. t('onboarding.details.lead').
    provideTranslocoScope('onboarding'),
  ],
})
export class OnboardingLayout {
  private readonly language = inject(LanguageService);
  protected readonly stage = inject(OnboardingStage);
  protected readonly draft = inject(OnboardingDraft);
  protected readonly lang = this.language.lang;

  /** The top bar's language link was clicked. */
  protected changeLanguage(lang: AppLang): void {
    // TODO(you): switch the app language here (same as in PublicLayout).
    void lang;
  }

  /** The top bar's Sign out was clicked. */
  protected signOut(): void {
    // TODO(you): sign out, then go to /sign-in.
  }
}
