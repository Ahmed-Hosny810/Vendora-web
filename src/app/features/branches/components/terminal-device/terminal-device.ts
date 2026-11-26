import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

/**
 * A counter terminal drawing: the screen shows the branch and terminal name,
 * and the device code is stuck on it like a label.
 * Decorative: the same text is in the form fields above it.
 */
@Component({
  selector: 'app-terminal-device',
  imports: [TranslocoDirective],
  template: `
    <ng-container *transloco="let t; read: 'branches.terminal'">
      <div class="body">
        <div class="screen">
          <small>{{ branchName() }}</small>
          <b>{{ name().trim() || t('namePlaceholder') }}</b>
          <span>{{ t('ready') }}</span>
        </div>
        <div class="keys">
          @for (k of keys; track k) {
            <i></i>
          }
        </div>
      </div>
      <div class="stand"></div>
      @if (code().trim()) {
        <!-- Re-created when the code changes, so the sticker lands again. -->
        @for (c of [code().trim()]; track c) {
          <span class="label" dir="ltr">{{ c }}</span>
        }
      }
    </ng-container>
  `,
  styleUrl: './terminal-device.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class TerminalDevice {
  readonly branchName = input('');
  readonly name = input('');
  readonly code = input('');

  protected readonly keys = [1, 2, 3, 4, 5, 6, 7, 8];
}
