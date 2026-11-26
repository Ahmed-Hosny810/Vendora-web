import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  linkedSignal,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LucideCheck, LucideHistory, LucideMail, LucideSend } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { KpiCard, LoadError } from '../../../shared/components/app';
import { ConfirmDialogData, VdButton, VdConfirmDialog } from '../../../shared/components/ui';
import { formatDate, formatDateTime, formatMoney } from '../../../shared/utils/format';
import { ShiftTable } from '../../shifts/components/shift-table/shift-table';
import { ShiftListItem } from '../../shifts/shifts.models';
import {
  EmployeeDetails,
  EmployeeStats,
  initials,
  INVITE_ROLES,
  InviteRole,
  RoleChangeResult,
} from '../employees.models';

/**
 * One employee (/employees/:id): who they are, their status and role,
 * their selling in the last 30 days and their recent shifts.
 * The owner and you can be viewed but not changed here.
 */
@Component({
  selector: 'app-employee-details-page',
  imports: [
    TranslocoDirective,
    VdButton,
    KpiCard,
    LoadError,
    ShiftTable,
    LucideCheck,
    LucideHistory,
    LucideMail,
    LucideSend,
  ],
  templateUrl: './employee-details.page.html',
  styleUrl: './employee-details.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The shift table reads its words from the shifts files.
  providers: [provideTranslocoScope('employees', 'shifts')],
})
export class EmployeeDetailsPage {
  protected readonly lang = inject(LanguageService).lang;
  protected readonly initials = initials;
  protected readonly money = formatMoney;
  protected readonly date = formatDate;
  protected readonly dateTime = formatDateTime;
  protected readonly roles = INVITE_ROLES;
  /** From the URL: /employees/<id>. */
  protected readonly employeeId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly shell = inject(AppShell);
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);
  private readonly transloco = inject(TranslocoService);

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly employee = signal<EmployeeDetails | null>(null);
  protected readonly stats = signal<EmployeeStats | null>(null);
  /** Newest first, up to 10. */
  protected readonly shifts = signal<ShiftListItem[]>([]);
  /** A status change (resend, deactivate…) is running. */
  protected readonly busy = signal(false);

  // ---------- Role ----------
  /** The role picked in the select; follows the loaded employee. */
  protected readonly role = linkedSignal<InviteRole | ''>(() => {
    const role = this.employee()?.role;
    return role && role !== 'owner' ? role : '';
  });
  protected readonly roleStatus = signal<'idle' | 'saving' | 'failed'>('idle');
  protected readonly roleChanged = computed(() => {
    const e = this.employee();
    return !!e && !!this.role() && this.role() !== e.role;
  });
  /** The owner and you can't be changed here. */
  protected readonly locked = computed(() => {
    const e = this.employee();
    return !e || e.isYou || e.role === 'owner';
  });

  constructor() {
    this.shell.setPage({ key: 'pages.employee' }, [
      { key: 'nav.employees', link: '/employees' },
      { key: 'pages.employee' },
    ]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the employee this.employeeId, their stats and recent shifts.
    //  - before: this.status.set('loading')
    //  - success: this.employee.set(e); this.stats.set(stats or null); this.shifts.set(list);
    //             this.status.set('ready')
    //             and show their name in the top bar:
    //             this.shell.setPage({ text: e.fullName }, [
    //               { key: 'nav.employees', link: '/employees' }, { text: e.fullName }])
    //  - not found / failure: this.status.set('error')
  }

  protected resend(): void {
    // TODO(you): resend the invitation.
    //  - before: this.busy.set(true); after: this.busy.set(false)
    //  - success: toast "Invitation sent again to {{email}}"
    //  - failure: toast "We couldn't resend the invitation. Try again."
  }

  protected cancelInvite(): void {
    this.ask('cancelTitle', 'cancelText', 'cancelConfirm').subscribe((yes) => {
      if (!yes) return;
      // TODO(you): cancel the invitation (busy like resend()), then go back to /employees.
    });
  }

  protected deactivate(): void {
    this.ask('deactivateTitle', 'deactivateText', 'deactivateConfirm').subscribe((yes) => {
      if (!yes) return;
      // TODO(you): deactivate (busy like resend()), then
      //  this.employee.update((e) => e && { ...e, status: 'inactive' })
    });
  }

  protected reactivate(): void {
    // TODO(you): reactivate (busy like resend()), then
    //  this.employee.update((e) => e && { ...e, status: 'active' })
    //  The plan's employee limit may refuse it: toast the reason.
  }

  protected async saveRole(): Promise<void> {
    const role = this.role();
    if (!role || !this.roleChanged() || this.roleStatus() === 'saving') return;
    this.roleStatus.set('saving');
    const result = await this.changeRole(role);
    if (result === 'saved') {
      this.employee.update((e) => e && { ...e, role });
      this.roleStatus.set('idle');
      return;
    }
    this.roleStatus.set('failed');
  }

  private async changeRole(role: InviteRole): Promise<RoleChangeResult> {
    // TODO(you): change this.employeeId's role, and return 'saved' or 'failed'.
    //  - success: toast "{{name}} is now {{role}}"
    void role;
    return 'failed';
  }

  /** The yes/no dialog, with the same texts as the employees list. */
  private ask(title: string, text: string, confirm: string) {
    const name = this.employee()?.fullName ?? '';
    const t = (key: string) => this.transloco.translate(`employees.list.${key}`, { name });
    return this.dialog.open<boolean, ConfirmDialogData>(VdConfirmDialog, {
      injector: this.injector,
      data: { title: t(title), message: t(text), confirmText: t(confirm), danger: true },
    }).closed;
  }
}
