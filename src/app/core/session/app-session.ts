import { computed, Injectable, signal } from '@angular/core';

import {
  AppNotification,
  BranchOption,
  SessionBusiness,
  SessionUser,
  SETUP_TASKS,
  SetupTask,
} from './session.models';

/**
 * Who is signed in and what they're working on: shared by the app shell
 * (sidebar, top bar) and every page inside it.
 *
 * All of it is filled by your logic.
 * TODO(you): load the user, business, branches and notifications after
 * sign-in (e.g. in a route resolver or an APP_INITIALIZER), and set them here.
 */
@Injectable({ providedIn: 'root' })
export class AppSession {
  readonly user = signal<SessionUser | null>(null);
  readonly business = signal<SessionBusiness | null>(null);

  readonly branches = signal<BranchOption[]>([]);
  readonly branchId = signal<string | null>(null);
  readonly branch = computed(
    () => this.branches().find((branch) => branch.id === this.branchId()) ?? null,
  );

  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount = computed(() => this.notifications().filter((n) => n.unread).length);

  /** Setup checklist tasks already finished. */
  readonly setupDone = signal<ReadonlySet<SetupTask>>(new Set());
  readonly setupTotal = SETUP_TASKS.length;

  readonly role = computed(() => this.user()?.role ?? null);
  /** Owners and admins manage the business; cashiers and inventory staff don't. */
  readonly isManager = computed(() => this.role() === 'owner' || this.role() === 'admin');
}
