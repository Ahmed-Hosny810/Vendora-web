import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { ExternalProvider } from '../../auth.models';

/**
 * "or continue with" + Google and Facebook buttons.
 *  - variant "key":     raised keys, for the dark terminal (sign in)
 *  - variant "outline": outlined buttons, for the receipt (register)
 *
 * @example
 * <app-social-buttons variant="key" (choose)="continueWith($event)" />
 */
@Component({
  selector: 'app-social-buttons',
  imports: [TranslocoDirective],
  templateUrl: './social-buttons.html',
  styleUrl: './social-buttons.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'is-' + variant()" },
})
export class SocialButtons {
  readonly variant = input<'key' | 'outline'>('key');
  readonly disabled = input(false);
  /** The user picked a provider. */
  readonly choose = output<ExternalProvider>();

  protected readonly providers: readonly { id: ExternalProvider; mark: string }[] = [
    { id: 'google', mark: 'G' },
    { id: 'facebook', mark: 'f' },
  ];
}
