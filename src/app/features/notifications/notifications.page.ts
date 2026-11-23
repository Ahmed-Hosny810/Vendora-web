import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideBellOff,
  LucideCheckCheck,
  LucideCircleCheck,
  LucideDynamicIcon,
  LucideIcon,
  LucideReceiptText,
  LucideSparkles,
  LucideTriangleAlert,
} from '@lucide/angular';

import { LanguageService } from '../../core/i18n';
import { AppNotification, AppSession } from '../../core/session';
import { AppShell } from '../../layouts/app-layout/app-shell';
import { LoadError, PageHead, SkeletonRows } from '../../shared/components/app';
import { VdButton } from '../../shared/components/ui';
import { formatDate } from '../../shared/utils/format';

/** Same pictures as the bell panel. */
const ICONS: Record<AppNotification['kind'], LucideIcon> = {
  success: LucideCircleCheck,
  invoice: LucideReceiptText,
  info: LucideSparkles,
  warning: LucideTriangleAlert,
};

type Group = 'today' | 'yesterday' | 'earlier';

/**
 * All notifications (/notifications), from "See all" in the bell panel.
 * Grouped by day, with an Unread filter and "Mark all as read".
 * The list lives in AppSession.notifications, shared with the bell.
 */
@Component({
  selector: 'app-notifications-page',
  imports: [
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    LucideDynamicIcon,
    LucideBellOff,
    LucideCheckCheck,
  ],
  templateUrl: './notifications.page.html',
  styleUrl: './notifications.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/notifications/<lang>.json (keys start with "notifications.").
  providers: [provideTranslocoScope('notifications')],
})
export class NotificationsPage {
  protected readonly session = inject(AppSession);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly icons = ICONS;
  protected readonly date = formatDate;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  /** More (older) notifications can be loaded. */
  protected readonly hasMore = signal(false);
  protected readonly loadingMore = signal(false);

  // ---------- Filter ----------
  protected readonly onlyUnread = signal(false);

  protected readonly groups = computed(() => {
    const list = this.session
      .notifications()
      .filter((n) => !this.onlyUnread() || n.unread)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);
    const groupOf = (n: AppNotification): Group =>
      n.createdAt >= startOfToday
        ? 'today'
        : n.createdAt >= startOfYesterday
          ? 'yesterday'
          : 'earlier';
    const order: Group[] = ['today', 'yesterday', 'earlier'];
    return order
      .map((key) => ({ key, items: list.filter((n) => groupOf(n) === key) }))
      .filter((g) => g.items.length);
  });

  constructor() {
    inject(AppShell).setPage({ key: 'pages.notifications' });
    this.load();
  }

  protected load(): void {
    // TODO(you): load the latest notifications (e.g. 30).
    //  - before: this.status.set('loading')
    //  - success: this.session.notifications.set(list); this.hasMore.set(more exist);
    //             this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected loadMore(): void {
    if (this.loadingMore()) return;
    // TODO(you): load the next (older) page and add it to this.session.notifications.
    //  - before: this.loadingMore.set(true); after: this.loadingMore.set(false)
    //  - set this.hasMore(false) when there are no more
  }

  protected markAllRead(): void {
    // TODO(you): tell the API, then mark them read in this.session.notifications
    //  (same as "Mark all as read" in the bell panel).
  }

  protected open(n: AppNotification): void {
    // TODO(you): mark it read, then open the record it's about (if any),
    //  same as clicking it in the bell panel.
    void n;
  }

  /** "14:32", for the time beside each notification. */
  protected time(date: Date): string {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
}
