import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck } from '@lucide/angular';

export interface MiniStep {
  /** Key under onboarding.status.steps, e.g. 'created' → "Business created". */
  key: string;
  /** done: tick · now: spinning ring · todo: empty ring */
  state: 'done' | 'now' | 'todo';
}

/**
 * Small vertical progress list on the payment-status page.
 *
 * @example
 * <app-steps-mini [steps]="[{ key: 'created', state: 'done' }, { key: 'waiting', state: 'now' }]" />
 */
@Component({
  selector: 'app-steps-mini',
  imports: [TranslocoDirective, LucideCheck],
  template: `
    <ol *transloco="let t; read: 'onboarding.status.steps'">
      @for (step of steps(); track step.key) {
        <li [class]="step.state" [attr.aria-current]="step.state === 'now' ? 'step' : null">
          <i aria-hidden="true">
            @if (step.state === 'done') {
              <svg lucideCheck></svg>
            }
          </i>
          {{ t(step.key) }}
        </li>
      }
    </ol>
  `,
  styleUrl: './steps-mini.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepsMini {
  readonly steps = input.required<MiniStep[]>();
}
