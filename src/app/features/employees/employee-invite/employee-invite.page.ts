import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import {
  email,
  form,
  FormField,
  maxLength,
  minLength,
  pattern,
  submit,
  validate,
} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleExclamationPoint,
  LucideKeyRound,
  LucideMonitor,
  LucidePackage,
  LucideSend,
  LucideShield,
} from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { FormSection, PageHead } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { StaffBadge } from '../components/staff-badge/staff-badge';
import {
  EMPLOYEE_LIMITS,
  INVITE_ROLES,
  InviteForm,
  suggestUsername,
  USERNAME_PATTERN,
} from '../employees.models';

type FieldKey = 'fullName' | 'username' | 'email';

/**
 * Invite employee (/employees/invite): name, username, email and a role.
 * They get temporary sign-in details by email and choose their own password
 * on first sign-in. The staff badge beside the form fills in as you type.
 */
@Component({
  selector: 'app-employee-invite-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    FormField,
    VdButton,
    PageHead,
    FormSection,
    StaffBadge,
    LucideCircleExclamationPoint,
    LucideKeyRound,
    LucideMonitor,
    LucidePackage,
    LucideSend,
    LucideShield,
  ],
  templateUrl: './employee-invite.page.html',
  styleUrl: './employee-invite.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/employees/<lang>.json (keys start with "employees.").
  providers: [provideTranslocoScope('employees')],
})
export class EmployeeInvitePage {
  protected readonly session = inject(AppSession);
  protected readonly limits = EMPLOYEE_LIMITS;
  protected readonly roles = INVITE_ROLES;
  protected readonly roleIcons = { admin: 'shield', cashier: 'monitor', inventoryStaff: 'package' };

  protected readonly model = signal<InviteForm>({
    fullName: '',
    username: '',
    email: '',
    role: 'cashier',
  });

  protected readonly inviteForm = form(this.model, (f) => {
    validate(f.fullName, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.fullName, EMPLOYEE_LIMITS.fullName);
    validate(f.username, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    minLength(f.username, EMPLOYEE_LIMITS.usernameMin);
    maxLength(f.username, EMPLOYEE_LIMITS.username);
    pattern(f.username, USERNAME_PATTERN);
    validate(f.email, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    email(f.email);
    maxLength(f.email, EMPLOYEE_LIMITS.email);
  });

  // ---------- Set by your logic ----------
  protected readonly status = signal<'idle' | 'sending' | 'limitReached' | 'failed'>('idle');
  protected readonly usernameTaken = signal(false);
  protected readonly emailTaken = signal(false);

  protected readonly tried = signal(false);
  protected readonly sending = computed(() => this.status() === 'sending');

  /** Key under employees.invite.errors for each field, or null. */
  protected readonly fieldErrors = computed(() => {
    const shown = (key: FieldKey) => {
      const field = this.inviteForm[key]();
      return field.touched() && field.invalid() ? (field.errors()[0]?.kind ?? 'required') : null;
    };
    const name = shown('fullName');
    const user = shown('username');
    const mail = shown('email');
    return {
      fullName: name ? 'nameRequired' : null,
      username: this.usernameTaken()
        ? 'usernameTaken'
        : user === 'required'
          ? 'usernameRequired'
          : user === 'pattern'
            ? 'usernamePattern'
            : user
              ? 'usernameLength'
              : null,
      email: this.emailTaken()
        ? 'emailTaken'
        : mail === 'required'
          ? 'emailRequired'
          : mail
            ? 'emailInvalid'
            : null,
    };
  });

  protected readonly errorCount = computed(
    () => Object.values(this.fieldErrors()).filter(Boolean).length,
  );

  constructor() {
    inject(AppShell).setPage({ key: 'pages.inviteEmployee' }, [
      { key: 'nav.employees', link: '/employees' },
      { key: 'pages.inviteEmployee' },
    ]);

    // Suggest a username from the name until the username is typed by hand.
    effect(() => {
      const suggestion = suggestUsername(this.model().fullName);
      if (untracked(() => this.inviteForm.username().dirty())) return;
      if (untracked(this.model).username !== suggestion) {
        this.model.update((m) => ({ ...m, username: suggestion }));
      }
    });
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.sending()) return;
    this.tried.set(true);
    this.usernameTaken.set(false);
    this.emailTaken.set(false);

    await submit(this.inviteForm, async () => {
      // TODO(you): send the invitation with this.model() (trim the text fields).
      //  - before: this.status.set('sending')
      //  - success: toast "Invitation sent to <email>" ("It can take a few minutes to arrive.
      //             If it doesn't, check spam or resend it."), then
      //             router.navigate(['/employees'], { state: { newId: id } })
      //  - username already used: this.status.set('idle'); this.usernameTaken.set(true)
      //  - email already used:    this.status.set('idle'); this.emailTaken.set(true)
      //  - plan limit reached:    this.status.set('limitReached')
      //  - other failure:         this.status.set('failed')
    });

    const first = (['fullName', 'username', 'email'] as const).find((k) => this.fieldErrors()[k]);
    if (first) document.getElementById(`inv-${first}`)?.focus();
  }
}
