import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Grey placeholder rows while a table loads. Screen readers hear `label` once.
 *
 * @example
 * <app-skeleton-rows [label]="t('loading')" [rows]="3" [columns]="4" />
 */
@Component({
  selector: 'app-skeleton-rows',
  template: `
    <span class="vd-sr" role="status">{{ label() }}</span>
    @for (r of rowList(); track r) {
      <div
        class="row"
        aria-hidden="true"
        [style.grid-template-columns]="'2fr repeat(' + (columns() - 1) + ', 1fr)'"
      >
        @for (c of columnList(); track c) {
          <span class="vd-skeleton"></span>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .row {
      display: grid;
      gap: 24px;
      padding: 18px 16px;
      border-bottom: 1px solid var(--line);
    }
    .row:last-child {
      border-bottom: 0;
    }
    .vd-skeleton {
      height: 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-busy': 'true' },
})
export class SkeletonRows {
  readonly label = input.required<string>();
  readonly rows = input(3);
  readonly columns = input(3);

  protected readonly rowList = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
  protected readonly columnList = computed(() =>
    Array.from({ length: this.columns() }, (_, i) => i),
  );
}
