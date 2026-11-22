import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideCircleExclamationPoint, LucideRefreshCw } from '@lucide/angular';

import { VdButton } from '../../../../shared/components/ui';

/**
 * "We couldn't load …" box with a Try again button.
 *
 * @example
 * <app-error-box [title]="t('plan.errorTitle')" [text]="t('plan.errorText')"
 *                [retryLabel]="t('tryAgain')" (retry)="loadPlans()" />
 */
@Component({
  selector: 'app-error-box',
  imports: [VdButton, LucideCircleExclamationPoint, LucideRefreshCw],
  template: `
    <span class="ic" aria-hidden="true"><svg lucideCircleExclamationPoint></svg></span>
    <h2>{{ title() }}</h2>
    <p>{{ text() }}</p>
    <button vdButton type="button" (click)="retry.emit()">
      <svg lucideRefreshCw aria-hidden="true"></svg>{{ retryLabel() }}
    </button>
  `,
  styleUrl: './error-box.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'alert' },
})
export class ErrorBox {
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly retryLabel = input.required<string>();
  readonly retry = output();
}
