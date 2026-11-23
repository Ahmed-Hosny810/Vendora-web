import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideCircleExclamationPoint, LucideRefreshCw } from '@lucide/angular';

import { VdButton } from '../../ui';

/**
 * "We couldn't load …" + Try again, for inside a table card or a page.
 *
 * @example
 * <app-load-error [title]="t('errorTitle')" [text]="t('errorText')"
 *                 [retryLabel]="t('tryAgain')" (retry)="load()" />
 */
@Component({
  selector: 'app-load-error',
  imports: [VdButton, LucideCircleExclamationPoint, LucideRefreshCw],
  template: `
    <div class="vd-empty" role="alert">
      <span class="vd-empty__art"><svg lucideCircleExclamationPoint></svg></span>
      <h2 class="vd-empty__title">{{ title() }}</h2>
      <p class="vd-empty__text">{{ text() }}</p>
      <button vdButton type="button" (click)="retry.emit()">
        <svg lucideRefreshCw aria-hidden="true"></svg>{{ retryLabel() }}
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadError {
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly retryLabel = input.required<string>();
  readonly retry = output();
}
