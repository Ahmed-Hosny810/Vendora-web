import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

/** One row: name on the start, figure on the end, a bar under them. */
export interface ShareRow {
  label: string;
  /** Second line under the name, e.g. the variant. */
  sub?: string | null;
  /** Sets the bar length (compared with the biggest row). */
  value: number;
  /** The figure on the end, already formatted. */
  figure: string;
  /**
   * Small text after the figure, e.g. "46% · 120 sales": a full translation
   * key and its values. Translated here, so it follows language switches.
   */
  note?: { key: string; params: Record<string, unknown> };
}

/**
 * A ranked list with one thin bar per row, all in one colour.
 * Every row carries its name and figure as text, so the colour never has
 * to tell rows apart.
 *
 * @example
 * <app-share-bars [rows]="paymentRows()" [label]="t('payments')" />
 */
@Component({
  selector: 'app-share-bars',
  imports: [TranslocoDirective],
  template: `
    <ol class="rows" [attr.aria-label]="label()" *transloco="let t">
      @for (row of scaled(); track $index) {
        <li class="row">
          <span class="name"
            ><bdi>{{ row.label }}</bdi>
            @if (row.sub) {
              <small
                ><bdi>{{ row.sub }}</bdi></small
              >
            }
          </span>
          <span class="fig"
            ><b
              ><bdi dir="ltr">{{ row.figure }}</bdi></b
            >
            @if (row.note) {
              <small>{{ t(row.note.key, row.note.params) }}</small>
            }
          </span>
          <span class="track" aria-hidden="true"><i [style.width.%]="row.width"></i></span>
        </li>
      }
    </ol>
  `,
  styles: `
    :host {
      display: block;
    }
    .rows {
      display: grid;
      gap: 14px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 6px 12px;
      align-items: baseline;
      font-size: 14px;
    }
    .name {
      min-width: 0;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    small {
      display: block;
      color: var(--ink-500);
      font-size: 12px;
      font-weight: 400;
    }
    .fig {
      text-align: end;
    }
    .fig b {
      font: 600 14px/1.2 var(--font-mono);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .track {
      grid-column: 1 / -1;
      height: 8px;
      overflow: hidden;
      border-radius: 4px;
      background: var(--paper-100);
    }
    .track i {
      display: block;
      height: 100%;
      border-radius: 4px;
      background: var(--pine-700);
      transition: width 400ms var(--ease-out);
    }
    @media (prefers-reduced-motion: reduce) {
      .track i {
        transition: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareBars {
  readonly rows = input.required<ShareRow[]>();
  /** Read by screen readers as the list's name. */
  readonly label = input('');

  protected readonly scaled = computed(() => {
    const max = Math.max(0, ...this.rows().map((row) => row.value));
    return this.rows().map((row) => ({
      ...row,
      width: max > 0 ? Math.max(1, (row.value / max) * 100) : 0,
    }));
  });
}
