import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';

import { LedState } from '../../auth.models';
import { StatusLeds } from '../status-leds/status-leds';

/**
 * The dark card-payment terminal that holds the sign-in form.
 *  - Content inside the tag goes on the white screen.
 *  - Content with the attribute `terminal-keys` goes under the screen
 *    (Google/Facebook keys, "Create account" line).
 *
 * Bump `shake` (1, 2, 3…) to make the terminal shake, e.g. on an error.
 *
 * @example
 * <app-card-terminal [led]="led()" [shake]="shakes()">
 *   <form>…</form>
 *   <div terminal-keys>…</div>
 * </app-card-terminal>
 */
@Component({
  selector: 'app-card-terminal',
  imports: [StatusLeds],
  templateUrl: './card-terminal.html',
  styleUrl: './card-terminal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardTerminal {
  readonly led = input<LedState>('ok');
  /** Change this number to shake the terminal once more. */
  readonly shake = input(0);

  protected readonly shaking = signal(false);

  constructor() {
    // Restart the shake animation each time `shake` changes:
    // remove the class, then add it back on the next frame.
    effect(() => {
      if (this.shake() === 0) return;
      this.shaking.set(false);
      requestAnimationFrame(() => this.shaking.set(true));
    });
  }
}
