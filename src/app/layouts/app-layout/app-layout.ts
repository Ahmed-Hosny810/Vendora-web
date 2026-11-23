import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { filter } from 'rxjs';

import { AppLang, LanguageService } from '../../core/i18n';
import { AppNotification, AppSession } from '../../core/session';
import { AppShell } from './app-shell';
import { AppSidebar } from './components/app-sidebar/app-sidebar';
import { AppTopbar } from './components/app-topbar/app-topbar';

/**
 * Frame for every signed-in business page: dark sidebar on the start side,
 * top bar, and the page below it. On phones the sidebar becomes a drawer
 * opened from the menu button.
 */
@Component({
  selector: 'app-app-layout',
  imports: [RouterOutlet, TranslocoDirective, AppSidebar, AppTopbar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    AppShell,
    // Loads public/i18n/shell/<lang>.json: keys start with "shell.".
    provideTranslocoScope('shell'),
  ],
  host: {
    '(document:keydown.escape)': 'shell.navOpen.set(false)',
  },
})
export class AppLayout {
  private readonly language = inject(LanguageService);
  protected readonly session = inject(AppSession);
  protected readonly shell = inject(AppShell);
  protected readonly lang = this.language.lang;

  /** The setup box in the sidebar: managers only, hidden once everything is done. */
  protected readonly setupDone = computed(() => {
    const done = this.session.setupDone().size;
    return this.session.isManager() && done < this.session.setupTotal ? done : null;
  });

  constructor() {
    // Close the phone drawer after moving to another page.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.shell.navOpen.set(false));

    // While the drawer is open, the page behind it doesn't scroll.
    const body = inject(DOCUMENT).body;
    effect(() => (body.style.overflow = this.shell.navOpen() ? 'hidden' : ''));
  }

  // ---------- top bar actions ----------
  protected changeLanguage(lang: AppLang): void {
    // TODO(you): switch the app language here (same as in PublicLayout).
    void lang;
  }

  protected changeBranch(id: string): void {
    // TODO(you): switch branch: this.session.branchId.set(id), then reload branch data.
    void id;
  }

  protected openProfile(): void {
    // TODO(you): go to the profile page (Settings → My account).
  }

  protected openChangePassword(): void {
    // TODO(you): go to Settings → Change password.
  }

  protected signOut(): void {
    // TODO(you): sign out, then go to /sign-in.
  }

  protected markAllRead(): void {
    // TODO(you): tell the API, then mark them read in this.session.notifications.
  }

  protected openNotification(notification: AppNotification): void {
    // TODO(you): mark it read, then open the record it's about (if any).
    void notification;
  }

  protected seeAllNotifications(): void {
    // TODO(you): go to the notifications page.
  }
}
