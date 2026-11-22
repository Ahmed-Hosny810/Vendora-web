import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

import { AppLang, LanguageService } from '../../core/i18n';
import { AuthPanel } from './auth-panel';
import { AuthSide } from './components/auth-side/auth-side';

/**
 * Frame for sign-in and sign-up: the green brand panel on one side,
 * the page (form) on the other. On phones the panel becomes a band on top.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, AuthSide],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    AuthPanel,
    // Loads public/i18n/auth/<lang>.json for the panel and every auth page.
    // Its keys start with "auth.", e.g. t('auth.signIn.title').
    provideTranslocoScope('auth'),
  ],
})
export class AuthLayout {
  private readonly language = inject(LanguageService);
  protected readonly panel = inject(AuthPanel);
  protected readonly lang = this.language.lang;

  /** The side panel's language switch was clicked. */
  protected changeLanguage(lang: AppLang): void {
    // TODO(you): switch the app language here (same as in PublicLayout).
    void lang;
  }
}
