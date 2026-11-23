import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A small number tile: label, big value, one line under it.
 * Pass value null to show "—" in grey (no data yet).
 *
 * @example
 * <app-kpi-card label="Open shifts" [value]="openShifts()" hint="No cashier is selling yet" />
 */
@Component({
  selector: 'app-kpi-card',
  template: `
    <span class="label">{{ label() }}</span>
    <b class="value" [class.value--empty]="value() === null"
      ><bdi dir="ltr">{{ value() ?? '—' }}</bdi></b
    >
    <small>{{ hint() }}</small>
  `,
  styles: `
    :host {
      display: grid;
      gap: 6px;
      min-width: 0;
      padding: 18px;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      background: var(--paper-0);
    }
    .label {
      color: var(--ink-500);
      font-size: 13px;
    }
    .value {
      font: 700 26px/1 var(--font-display);
      font-variant-numeric: tabular-nums;
    }
    .value--empty {
      color: var(--ink-500);
    }
    small {
      color: var(--ink-500);
      font-size: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  readonly label = input.required<string>();
  /** Already formatted (e.g. "1,250.00 EGP"), or null for "no data yet". */
  readonly value = input<string | number | null>(null);
  readonly hint = input('');
}
