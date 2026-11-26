import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideLock } from '@lucide/angular';

import { AppShell } from '../../layouts/app-layout/app-shell';
import { VdButton } from '../../shared/components/ui';

/**
 * "This area is for managers": shown inside the app shell when the user's
 * role can't open a page. A STAFF ONLY tag hangs from the padlock.
 *
 * @example
 * // route guard sends the user here with the area's nav key:
 * router.navigate(['/access-denied'], { queryParams: { area: 'billing' } })
 */
@Component({
  selector: 'app-access-denied-page',
  imports: [RouterLink, TranslocoDirective, VdButton, LucideLock],
  templateUrl: './access-denied.page.html',
  styleUrl: './access-denied.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDeniedPage {
  // ---------- Set by your logic ----------
  /**
   * Key under shell.nav of the page they tried to open, e.g. 'billing'.
   * TODO(you): set it from the ?area= query parameter.
   */
  protected readonly area = signal<string | null>(null);

  constructor() {
    // The top bar shows the name of the page they tried to open.
    const shell = inject(AppShell);
    effect(() => shell.setTitle(this.area() ?? 'overview'));
  }
}
