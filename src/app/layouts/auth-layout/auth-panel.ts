import { Injectable, signal } from '@angular/core';

/** Which text the green side panel shows. */
export type AuthPanelKind = 'signIn' | 'register' | 'verify' | 'forgot' | 'reset' | 'external';

/**
 * Lets a page choose what the side panel says.
 * Provided by AuthLayout, so every page inside it shares one copy.
 *
 * @example
 * // in a page:
 * private readonly panel = inject(AuthPanel);
 * constructor() { this.panel.show('register'); }
 */
@Injectable()
export class AuthPanel {
  readonly kind = signal<AuthPanelKind>('signIn');
  /** For 'external': the provider name shown in the text, e.g. "Google". */
  readonly provider = signal('');

  show(kind: AuthPanelKind, provider = ''): void {
    this.kind.set(kind);
    this.provider.set(provider);
  }
}
