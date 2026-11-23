import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideBell,
  LucideCheck,
  LucideChevronDown,
  LucideChevronRight,
  LucideGlobe,
  LucideKeyRound,
  LucideLogOut,
  LucideMenu,
  LucideStore,
  LucideUser,
} from '@lucide/angular';

import { AppLang } from '../../../../core/i18n';
import { AppNotification, BranchOption, SessionUser } from '../../../../core/session';
import { ShellLabel } from '../../app-shell';
import { NotificationsPanel } from '../notifications-panel/notifications-panel';

/** Which drop-down is open. */
type Panel = 'branch' | 'bell' | 'user';

/**
 * Top bar of the app: menu button (phones), page title, branch switch,
 * notifications bell, language link and the account menu.
 * It only draws and reports clicks; AppLayout decides what they do.
 *
 * The drop-downs are simple disclosures: a button with aria-expanded and a
 * panel under it. Clicking outside or pressing Escape closes them.
 * (CDK Overlay would add ~60 kB to the first page load.)
 */
@Component({
  selector: 'app-topbar',
  imports: [
    RouterLink,
    TranslocoDirective,
    NotificationsPanel,
    LucideBell,
    LucideCheck,
    LucideChevronDown,
    LucideChevronRight,
    LucideGlobe,
    LucideKeyRound,
    LucideLogOut,
    LucideMenu,
    LucideStore,
    LucideUser,
  ],
  templateUrl: './app-topbar.html',
  styleUrl: './app-topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeAndRefocus()',
  },
})
export class AppTopbar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly title = input.required<ShellLabel>();
  readonly crumbs = input<ShellLabel[]>([]);
  readonly user = input<SessionUser | null>(null);
  readonly businessName = input('');
  readonly branches = input<BranchOption[]>([]);
  readonly branch = input<BranchOption | null>(null);
  readonly notifications = input<AppNotification[]>([]);
  readonly unreadCount = input(0);
  readonly lang = input.required<AppLang>();

  readonly menuClick = output();
  readonly branchChange = output<string>();
  readonly languageChange = output<AppLang>();
  readonly profile = output();
  readonly changePassword = output();
  readonly signOut = output();
  readonly markAllRead = output();
  readonly openNotification = output<AppNotification>();
  readonly seeAllNotifications = output();

  protected readonly open = signal<Panel | null>(null);

  protected readonly initials = computed(() =>
    (this.user()?.name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase(),
  );

  /** The language the link switches TO. */
  protected readonly other = computed(() =>
    this.lang() === 'ar'
      ? { code: 'en' as const, label: 'English' }
      : { code: 'ar' as const, label: 'العربية' },
  );

  protected toggle(panel: Panel): void {
    this.open.update((current) => (current === panel ? null : panel));
  }

  protected close(): void {
    this.open.set(null);
  }

  /** A click anywhere outside the top bar closes the open drop-down. */
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.contains(event.target as Node)) this.close();
  }

  /** Escape closes it and puts focus back on the button that opened it. */
  protected closeAndRefocus(): void {
    const panel = this.open();
    if (!panel) return;
    this.close();
    this.host.querySelector<HTMLElement>(`[data-panel="${panel}"]`)?.focus();
  }
}
