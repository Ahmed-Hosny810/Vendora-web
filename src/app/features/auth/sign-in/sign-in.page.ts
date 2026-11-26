import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { form, FormField, pattern, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleExclamationPoint,
  LucideInfo,
  LucideMail,
  LucideTriangleExclamationPoint,
} from '@lucide/angular';

import { AuthPanel } from '../../../layouts/auth-layout/auth-panel';
import { SITE_LINKS } from '../../../layouts/public-layout/site-links';
import { VdButton } from '../../../shared/components/ui';
import { EMAIL_PATTERN, ExternalProvider, LedState, SignInStatus } from '../auth.models';
import { CardTerminal } from '../components/card-terminal/card-terminal';
import { PasswordInput } from '../components/password-input/password-input';
import { SocialButtons } from '../components/social-buttons/social-buttons';

/** Provider names are brand names: the same in every language. */
const PROVIDER_NAMES: Record<ExternalProvider, string> = { google: 'Google', facebook: 'Facebook' };

/** One message box above the form. Keys are under auth.signIn.banner. */
interface Banner {
  tone: 'danger' | 'info' | 'warning';
  icon: 'error' | 'mail' | 'warning' | 'info';
  title: string;
  text: string;
  /** "alert" interrupts the screen reader; "status" waits politely. */
  role: 'alert' | 'status';
}

const BANNERS: Partial<Record<SignInStatus, Banner>> = {
  wrongCredentials: {
    tone: 'danger',
    icon: 'error',
    title: 'wrongTitle',
    text: 'wrongText',
    role: 'alert',
  },
  emailNotVerified: {
    tone: 'info',
    icon: 'mail',
    title: 'verifyTitle',
    text: 'verifyText',
    role: 'alert',
  },
  inactive: {
    tone: 'warning',
    icon: 'warning',
    title: 'inactiveTitle',
    text: 'inactiveText',
    role: 'alert',
  },
  externalCancelled: {
    tone: 'info',
    icon: 'info',
    title: 'cancelledTitle',
    text: 'cancelledText',
    role: 'status',
  },
  externalUnavailable: {
    tone: 'warning',
    icon: 'warning',
    title: 'unavailableTitle',
    text: 'unavailableText',
    role: 'alert',
  },
  externalNoEmail: {
    tone: 'warning',
    icon: 'warning',
    title: 'noEmailTitle',
    text: 'noEmailText',
    role: 'alert',
  },
  externalConflict: {
    tone: 'danger',
    icon: 'error',
    title: 'conflictTitle',
    text: '',
    role: 'alert',
  },
};

/**
 * Sign in: a form on a card-payment terminal.
 *
 * The page draws whatever `status` says (see SignInStatus). Your logic
 * (the TODOs below) calls the API and sets `status`.
 */
@Component({
  selector: 'app-sign-in-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    FormField,
    VdButton,
    CardTerminal,
    PasswordInput,
    SocialButtons,
    LucideCircleExclamationPoint,
    LucideInfo,
    LucideMail,
    LucideTriangleExclamationPoint,
  ],
  templateUrl: './sign-in.page.html',
  styleUrl: './sign-in.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPage {
  private readonly panel = inject(AuthPanel);

  // ---------- Form ----------
  protected readonly model = signal({ email: '', password: '' });

  protected readonly signInForm = form(this.model, (f) => {
    required(f.email);
    // Like name@example.com: something @ something . something
    pattern(f.email, EMAIL_PATTERN);
    required(f.password);
  });

  /**
   * Translation key of the error to show, or null. Errors show only after
   * the user leaves the field, or after a submit (which touches every field).
   */
  protected readonly emailError = computed(() => {
    const field = this.signInForm.email();
    if (!field.touched() || !field.invalid()) return null;
    return field.errors()[0].kind === 'required' ? 'emailRequired' : 'emailInvalid';
  });

  protected readonly passwordError = computed(() => {
    const field = this.signInForm.password();
    return field.touched() && field.invalid() ? 'passwordRequired' : null;
  });

  // ---------- What the page shows (set by your logic) ----------
  protected readonly status = signal<SignInStatus>('idle');
  /** Which provider the external states talk about. */
  protected readonly provider = signal<ExternalProvider>('google');
  /** For 'externalConflict': the message the server sent back. */
  protected readonly serverMessage = signal('');

  // ---------- Derived UI ----------
  protected readonly busy = computed(() => this.status() === 'submitting');
  protected readonly providerName = computed(() => PROVIDER_NAMES[this.provider()]);
  protected readonly banner = computed(() => BANNERS[this.status()] ?? null);
  protected readonly contactUrl = SITE_LINKS.contactSupport;

  /** Terminal lights: yellow while waiting, red on an error, green otherwise. */
  protected readonly led = computed<LedState>(() => {
    const status = this.status();
    if (status === 'submitting' || status === 'redirecting') return 'wait';
    const tone = this.banner()?.tone;
    if (tone === 'danger' || this.emailError() || this.passwordError()) return 'err';
    return 'ok';
  });

  /** Bumped to shake the terminal. */
  protected readonly shakes = signal(0);

  constructor() {
    // The side panel talks about Google/Facebook while redirecting.
    effect(() => {
      if (this.status() === 'redirecting') this.panel.show('external', this.providerName());
      else this.panel.show('signIn');
    });

    // Shake on a red error from the server.
    effect(() => {
      if (BANNERS[this.status()]?.tone === 'danger') this.shakes.update((n) => n + 1);
    });
  }

  // ---------- Actions ----------

  /** submit() marks every field touched (so errors show), then runs only if valid. */
  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy()) return;
    if (this.signInForm().invalid()) this.shakes.update((n) => n + 1);

    await submit(this.signInForm, async () => {
      // TODO(you): sign in with this.model().email and this.model().password.
      //  - before the request:  this.status.set('submitting')
      //  - wrong email/password: this.status.set('wrongCredentials')
      //  - email not verified:   this.status.set('emailNotVerified')
      //  - account inactive:     this.status.set('inactive')
      //  - success:              navigate to the app
    });
  }

  /** Google or Facebook key pressed. */
  protected continueWith(provider: ExternalProvider): void {
    this.provider.set(provider);
    // TODO(you): start the external sign-in.
    //  - while leaving for the provider's page: this.status.set('redirecting')
    //  - when it comes back with a problem, set one of:
    //    'externalCancelled' | 'externalUnavailable' | 'externalNoEmail'
    //    'externalConflict' (and this.serverMessage.set(<message from server>))
  }

  /** "Cancel" while redirecting. */
  protected cancelRedirect(): void {
    // TODO(you): stop the redirect if possible, then:
    this.status.set('externalCancelled');
  }
}
