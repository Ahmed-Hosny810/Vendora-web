/**
 * An email like name@example.com. Stricter than Angular's email(),
 * which also accepts "name@example" (no dot in the domain).
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Google or Facebook. */
export type ExternalProvider = 'google' | 'facebook';

/** The three lights on the terminal and the printer. */
export type LedState = 'ok' | 'wait' | 'err';

/**
 * What the sign-in page is showing. Your logic sets it; the page draws it.
 *  - idle:                 the form, nothing else
 *  - submitting:           "Signing you in…" with a moving bar; form locked
 *  - wrongCredentials:     red "Email or password is incorrect."
 *  - emailNotVerified:     blue "Verify your email to sign in."
 *  - inactive:             yellow "This account is inactive."
 *  - redirecting:          "Taking you to Google…" with a Cancel button
 *  - externalCancelled:    the user cancelled on Google/Facebook
 *  - externalUnavailable:  the provider can't be used right now
 *  - externalNoEmail:      the provider didn't share an email
 *  - externalConflict:     the server refused; shows its message
 */
export type SignInStatus =
  | 'idle'
  | 'submitting'
  | 'wrongCredentials'
  | 'emailNotVerified'
  | 'inactive'
  | 'redirecting'
  | 'externalCancelled'
  | 'externalUnavailable'
  | 'externalNoEmail'
  | 'externalConflict';

/**
 * What the register page is showing.
 *  - idle:        the form
 *  - submitting:  "Creating account…"; form locked
 *  - success:     APPROVED stamp; the button becomes "Check your email"
 */
export type RegisterStatus = 'idle' | 'submitting' | 'success';

/** Which password rules pass. All true = the password is accepted. */
export interface PasswordChecks {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
}

/** Checks a password against the four rules. */
export function checkPassword(password: string): PasswordChecks {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
}
