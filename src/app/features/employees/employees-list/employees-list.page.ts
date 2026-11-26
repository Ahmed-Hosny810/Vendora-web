import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, Injector, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LucideEllipsis, LucideSend, LucideUserPlus, LucideUsers } from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { ConfirmDialogData, VdButton, VdConfirmDialog } from '../../../shared/components/ui';
import { Employee, initials } from '../employees.models';

/**
 * Employees (/employees): who can sign in to the business and what they can do.
 * Invited people show "Invitation sent" until they sign in for the first time.
 */
@Component({
  selector: 'app-employees-list-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    LucideEllipsis,
    LucideSend,
    LucideUserPlus,
    LucideUsers,
  ],
  templateUrl: './employees-list.page.html',
  styleUrl: './employees-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/employees/<lang>.json (keys start with "employees.").
  providers: [provideTranslocoScope('employees')],
  host: {
    '(document:click)': 'closeMenu($event)',
    '(document:keydown.escape)': 'menuFor.set(null)',
    '(window:scroll)': 'menuFor.set(null)',
    '(window:resize)': 'menuFor.set(null)',
  },
})
export class EmployeesListPage {
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);
  private readonly transloco = inject(TranslocoService);
  protected readonly session = inject(AppSession);
  protected readonly initials = initials;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly employees = signal<Employee[]>([]);
  /** The person invited last (sent here by the invite page): their row flashes once. */
  protected readonly newId = signal<string | null>(history.state?.newId ?? null);
  /** Ids with a request running (resend, cancel, deactivate…): their buttons wait. */
  protected readonly busyIds = signal<string[]>([]);

  /** Which row's "…" menu is open. */
  protected readonly menuFor = signal<string | null>(null);
  /**
   * Where the menu shows, under its button. It's placed on the screen (position: fixed)
   * because the table's scroll box would cut it off on the last rows.
   */
  protected readonly menuPos = signal({ top: 0, end: 0 });

  constructor() {
    inject(AppShell).setPage({ key: 'nav.employees' }, [{ key: 'nav.employees' }]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the employees (mark the signed-in user with isYou: true).
    //  - before: this.status.set('loading')
    //  - success: this.employees.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected isBusy(id: string): boolean {
    return this.busyIds().includes(id);
  }

  protected toggleMenu(id: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.menuFor() === id) {
      this.menuFor.set(null);
      return;
    }
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const rtl = document.documentElement.dir === 'rtl';
    // "end" = distance from the screen's end edge (right in English, left in Arabic).
    this.menuPos.set({
      top: box.bottom + 4,
      end: rtl ? box.left : window.innerWidth - box.right,
    });
    this.menuFor.set(id);
  }

  /** A click outside the open menu closes it. */
  protected closeMenu(event: Event): void {
    if (!(event.target as HTMLElement).closest('.more')) this.menuFor.set(null);
  }

  protected resend(e: Employee): void {
    // TODO(you): send the invitation again.
    //  - before: this.busyIds.update((ids) => [...ids, e.id])
    //  - after (success or not): remove e.id from busyIds
    //  - success: toast "Invitation sent to <email>"
    //  - failure: toast error "We couldn't resend the invitation. Try again."
    void e;
  }

  protected cancelInvite(e: Employee): void {
    this.menuFor.set(null);
    this.ask('cancelTitle', 'cancelText', 'cancelConfirm', e).subscribe((yes) => {
      if (!yes) return;
      // TODO(you): cancel the invitation (busyIds like resend()), then remove e from this.employees.
    });
  }

  protected deactivate(e: Employee): void {
    this.ask('deactivateTitle', 'deactivateText', 'deactivateConfirm', e).subscribe((yes) => {
      if (!yes) return;
      // TODO(you): deactivate (busyIds like resend()), then set e.status to 'inactive' in this.employees.
    });
  }

  protected reactivate(e: Employee): void {
    // TODO(you): reactivate (busyIds like resend()), then set e.status to 'active' in this.employees.
    //  The plan's employee limit may refuse it: toast the reason.
    void e;
  }

  /** Opens the yes/no dialog with texts from employees.list.<key>. */
  private ask(title: string, text: string, confirm: string, e: Employee) {
    const t = (key: string) =>
      this.transloco.translate(`employees.list.${key}`, { name: e.fullName });
    return this.dialog.open<boolean, ConfirmDialogData>(VdConfirmDialog, {
      injector: this.injector,
      data: { title: t(title), message: t(text), confirmText: t(confirm), danger: true },
    }).closed;
  }
}
