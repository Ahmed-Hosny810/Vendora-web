import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideBellOff,
  LucideCircleCheck,
  LucideIcon,
  LucideReceiptText,
  LucideSparkles,
  LucideTriangleAlert,
} from '@lucide/angular';
import { LucideDynamicIcon } from '@lucide/angular';

import { AppLang } from '../../../../core/i18n';
import { AppNotification } from '../../../../core/session';

const ICONS: Record<AppNotification['kind'], LucideIcon> = {
  success: LucideCircleCheck,
  invoice: LucideReceiptText,
  info: LucideSparkles,
  warning: LucideTriangleAlert,
};

/**
 * The bell's drop-down: latest notifications, "Mark all as read",
 * and an "all caught up" state when the list is empty.
 */
@Component({
  selector: 'app-notifications-panel',
  imports: [TranslocoDirective, LucideDynamicIcon, LucideBellOff],
  templateUrl: './notifications-panel.html',
  styleUrl: './notifications-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPanel {
  readonly notifications = input.required<AppNotification[]>();
  readonly lang = input<AppLang>('en');
  readonly markAllRead = output();
  /** A notification was clicked. */
  readonly openItem = output<AppNotification>();
  readonly seeAll = output();

  protected readonly icons = ICONS;
  protected readonly hasUnread = computed(() => this.notifications().some((n) => n.unread));

  /** "2 min ago" / "منذ دقيقتين", in the current language. */
  protected timeAgo(date: Date): string {
    const minutes = Math.round((date.getTime() - Date.now()) / 60000);
    const format = new Intl.RelativeTimeFormat(this.lang(), { numeric: 'auto', style: 'short' });
    if (Math.abs(minutes) < 60) return format.format(minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return format.format(hours, 'hour');
    return format.format(Math.round(hours / 24), 'day');
  }
}
