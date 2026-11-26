import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LedState } from '../../auth.models';

/**
 * Three small lights: green (ok), yellow (waiting), red (error).
 * The one matching `state` is lit and blinks. Decoration only.
 */
@Component({
  selector: 'app-status-leds',
  template: `
    <i class="led led--ok" [class.on]="state() === 'ok'"></i>
    <i class="led led--wait" [class.on]="state() === 'wait'"></i>
    <i class="led led--err" [class.on]="state() === 'err'"></i>
  `,
  styleUrl: './status-leds.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class StatusLeds {
  readonly state = input.required<LedState>();
}
