import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Heading at the top of an app page: big title, one line under it,
 * and the page's main buttons on the end side.
 *
 * @example
 * <app-page-head [title]="t('title')" [text]="t('sub')">
 *   <span title-extra class="vd-badge">Main</span>     ← next to the title
 *   <a vdButton="primary" routerLink="new">Add</a>     ← buttons
 * </app-page-head>
 */
@Component({
  selector: 'app-page-head',
  template: `
    <div class="t">
      <h1>{{ title() }}<ng-content select="[title-extra]" /></h1>
      @if (text()) {
        <p>{{ text() }}</p>
      }
    </div>
    <div class="acts"><ng-content /></div>
  `,
  styleUrl: './page-head.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHead {
  readonly title = input.required<string>();
  readonly text = input('');
}
