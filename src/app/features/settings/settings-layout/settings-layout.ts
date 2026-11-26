import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';

import { AppSession } from '../../../core/session';
import { PageHead } from '../../../shared/components/app';
import { SETTINGS_TABS } from '../settings.models';

/**
 * Settings (/settings/...): the page title and the tabs, then the open tab
 * below. Everyone can open "My account" and "Password"; only owners and
 * admins see "Business".
 */
@Component({
  selector: 'app-settings-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoDirective, PageHead],
  template: `
    <ng-container *transloco="let t; read: 'settings'">
      <app-page-head [title]="t('title')" [text]="t('text')" />
      <nav class="vd-tabs" [attr.aria-label]="t('tabs')">
        @for (tab of tabs(); track tab.key) {
          <a class="vd-tab" [routerLink]="tab.link" routerLinkActive ariaCurrentWhenActive="page">{{
            t('tabNames.' + tab.key)
          }}</a>
        }
      </nav>
      <router-outlet />
    </ng-container>
  `,
  styles: `
    :host {
      display: contents;
    }
    // The outlet is an empty marker; the tab's page is drawn after it.
    // Hidden so it doesn't add an extra gap in the page grid.
    router-outlet {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/settings/<lang>.json for this page and its tabs.
  providers: [provideTranslocoScope('settings')],
})
export class SettingsLayout {
  private readonly session = inject(AppSession);

  protected readonly tabs = computed(() =>
    SETTINGS_TABS.filter((tab) => !tab.managers || this.session.isManager()),
  );
}
