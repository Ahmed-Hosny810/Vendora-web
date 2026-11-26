import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideArrowLeft } from '@lucide/angular';

import { AppLang, AVAILABLE_LANGS } from '../../../../core/i18n';
import { VdWordmark } from '../../../../shared/components/ui';
import { AuthPanelKind } from '../../auth-panel';

/**
 * Green brand panel of the sign-in / sign-up pages: logo, "Back to home",
 * a big welcome line and a language switch. Floating price tags decorate it.
 */
@Component({
  selector: 'app-auth-side',
  imports: [RouterLink, TranslocoDirective, VdWordmark, LucideArrowLeft],
  templateUrl: './auth-side.html',
  styleUrl: './auth-side.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'vd-inverse' },
})
export class AuthSide {
  readonly kind = input.required<AuthPanelKind>();
  /** Provider name for the 'external' text, e.g. "Google". */
  readonly provider = input('');
  readonly lang = input.required<AppLang>();
  readonly languageChange = output<AppLang>();

  protected readonly languages = AVAILABLE_LANGS;
  protected readonly year = new Date().getFullYear();
  /** Translation keys start here: side.signIn.title, side.register.title… */
  protected readonly key = computed(() => 'side.' + this.kind());
}
