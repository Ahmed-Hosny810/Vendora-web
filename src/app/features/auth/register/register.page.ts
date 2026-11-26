import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { form, FormField, pattern, required, submit, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LucideCircleExclamationPoint } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AuthPanel } from '../../../layouts/auth-layout/auth-panel';
import { SITE_LINKS } from '../../../layouts/public-layout/site-links';
import {
  checkPassword,
  EMAIL_PATTERN,
  ExternalProvider,
  LedState,
  RegisterStatus,
} from '../auth.models';
import { PasswordInput } from '../components/password-input/password-input';
import { PasswordRules } from '../components/password-rules/password-rules';
import { ReceiptPrinter, ReceiptStamp } from '../components/receipt-printer/receipt-printer';
import { SocialButtons } from '../components/social-buttons/social-buttons';

/**
 * Create account: the form prints out as a receipt.
 *
 * The page draws whatever `status` says (see RegisterStatus). Your logic
 * (the TODOs below) calls the API and sets `status`, `usernameTaken`
 * and `emailTaken`.
 */
@Component({
  selector: 'app-register-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    FormField,
    ReceiptPrinter,
    PasswordInput,
    PasswordRules,
    SocialButtons,
    LucideCircleExclamationPoint,
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly panel = inject(AuthPanel);
  private readonly transloco = inject(TranslocoService);
  private readonly language = inject(LanguageService);

  // ---------- Form ----------
  protected readonly model = signal({
    name: '',
    username: '',
    email: '',
    password: '',
    confirm: '',
  });

  protected readonly registerForm = form(this.model, (f) => {
    required(f.name);
    required(f.username);
    required(f.email);
    // Like name@example.com: something @ something . something
    pattern(f.email, EMAIL_PATTERN);
    required(f.password);
    // All four rules must pass (see checkPassword in auth.models.ts).
    validate(f.password, ({ value }) => {
      const checks = checkPassword(value());
      return Object.values(checks).every(Boolean) ? null : { kind: 'rules' };
    });
    required(f.confirm);
    validate(f.confirm, ({ value, valueOf }) =>
      value() && value() !== valueOf(f.password) ? { kind: 'mismatch' } : null,
    );
  });

  // ---------- Set by your logic when the server says so ----------
  protected readonly status = signal<RegisterStatus>('idle');
  /** The server says this username is already used. */
  protected readonly usernameTaken = signal(false);
  /** The server says this email already has an account. */
  protected readonly emailTaken = signal(false);

  /**
   * Translation key of each field's error, or null.
   * Server errors win; rule errors show after the field is touched.
   */
  protected readonly errors = computed(() => {
    const f = this.registerForm;
    const shown = (field: { touched(): boolean; invalid(): boolean }) =>
      field.touched() && field.invalid();
    const firstKind = (field: { errors(): readonly { kind: string }[] }) => field.errors()[0]?.kind;

    return {
      name: shown(f.name()) ? 'nameRequired' : null,
      username: this.usernameTaken()
        ? 'usernameTaken'
        : shown(f.username())
          ? 'usernameRequired'
          : null,
      email: this.emailTaken()
        ? 'emailTaken'
        : shown(f.email())
          ? firstKind(f.email()) === 'required'
            ? 'emailRequired'
            : 'emailInvalid'
          : null,
      password: shown(f.password())
        ? firstKind(f.password()) === 'required'
          ? 'passwordRequired'
          : 'passwordRules'
        : null,
      confirm: shown(f.confirm())
        ? firstKind(f.confirm()) === 'required'
          ? 'confirmRequired'
          : 'mismatch'
        : null,
    };
  });

  /** Which password rules pass right now (for the red rules box). */
  protected readonly checks = computed(() => checkPassword(this.model().password));
  protected readonly showRules = computed(() => this.errors().password === 'passwordRules');

  // ---------- Derived UI ----------
  protected readonly busy = computed(() => this.status() === 'submitting');
  protected readonly done = computed(() => this.status() === 'success');
  protected readonly termsUrl = SITE_LINKS.terms;
  protected readonly privacyUrl = SITE_LINKS.privacy;

  protected readonly led = computed<LedState>(() => {
    if (this.done()) return 'ok';
    if (this.busy()) return 'wait';
    return Object.values(this.errors()).some(Boolean) ? 'err' : 'wait';
  });

  /** Text on the printer. */
  protected readonly printerTitle = computed(() => {
    this.language.lang(); // re-run when the language changes
    const key = this.done() ? 'approved' : this.busy() ? 'sending' : 'printing';
    return this.transloco.translate(`auth.register.${key}`);
  });

  protected readonly stamp = computed<ReceiptStamp | null>(() => {
    this.language.lang();
    if (!this.done()) return null;
    return {
      word: this.transloco.translate('auth.register.stampWord'),
      sub: this.transloco.translate('auth.register.stampSub'),
    };
  });

  constructor() {
    this.panel.show('register');

    // When the user changes the username/email, the server's "taken" no longer applies.
    effect(() => {
      this.model().username;
      this.usernameTaken.set(false);
    });
    effect(() => {
      this.model().email;
      this.emailTaken.set(false);
    });
  }

  // ---------- Actions ----------

  /** submit() marks every field touched (so errors show), then runs only if valid. */
  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy() || this.done()) return;

    await submit(this.registerForm, async () => {
      // TODO(you): create the account with this.model() (not "confirm").
      //  - before the request:       this.status.set('submitting')
      //  - username already used:    this.usernameTaken.set(true); this.status.set('idle')
      //  - email already registered: this.emailTaken.set(true);    this.status.set('idle')
      //  - success:                  this.status.set('success')
    });
  }

  /** "Check your email" button, shown after success. */
  protected continueAfterSuccess(): void {
    // TODO(you): go to /check-email (and pass the email so it can show it).
  }

  /** Google or Facebook pressed. */
  protected continueWith(provider: ExternalProvider): void {
    // TODO(you): start the external sign-up with this provider.
    void provider;
  }
}
