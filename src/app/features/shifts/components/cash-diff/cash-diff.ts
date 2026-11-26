import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { CashDiffKind, formatSigned } from '../../shifts.models';

/**
 * The counted-vs-expected box: a stamped label ("CASH SHORTAGE"), the
 * difference, an optional red · green · blue scale with a needle, and a line of text.
 */
@Component({
  selector: 'app-cash-diff',
  template: `
    <div class="h">
      <span class="lbl">{{ label() }}</span>
      <b dir="ltr">{{ signed() }}</b>
    </div>
    @if (scale()) {
      <div class="scale" aria-hidden="true"><i [style.inset-inline-start.%]="needle()"></i></div>
    }
    <p>{{ text() }}</p>
  `,
  styleUrl: './cash-diff.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status', '[class]': '"is-" + kind()' },
})
export class CashDiff {
  readonly kind = input.required<CashDiffKind>();
  /** Counted − expected. */
  readonly diff = input.required<number>();
  /** Already translated. */
  readonly label = input.required<string>();
  readonly text = input('');
  readonly scale = input(true);

  protected readonly signed = computed(() => formatSigned(this.diff()));

  /**
   * Where the needle sits (% from the start). The scale is red 0–40,
   * green 40–60, blue 60–100; 200 EGP or more off reaches the end.
   */
  protected readonly needle = computed(() => {
    const d = this.diff();
    const far = Math.min(Math.abs(d) / 200, 1) * 36;
    if (this.kind() === 'balanced') return 50;
    return d < 0 ? 38 - far : 62 + far;
  });
}
