import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Two shirts dropping into a green crate, with "× 24" on its label.
 * Beside the opening stock form; the label follows the quantity typed.
 */
@Component({
  selector: 'app-stock-crate',
  template: `
    <svg viewBox="0 0 210 150" aria-hidden="true">
      <g class="item" style="animation-delay: 0.1s">
        <path
          d="M70 74 L96 66 Q105 74 114 66 L140 74 L148 92 L138 96 L134 90 L134 120 L76 120 L76 90 L72 96 L62 92 Z"
          fill="var(--paper-0)"
        />
      </g>
      <g class="item" style="animation-delay: 0.3s">
        <path
          d="M100 62 L124 56 Q132 62 140 56 L164 62 L172 80 L162 84 L158 78 L158 110 L106 110 L106 78 L102 84 L92 80 Z"
          fill="var(--butter-500)"
        />
      </g>
      <rect x="30" y="96" width="150" height="48" rx="4" fill="var(--pine-700)" />
      <path d="M30 112 H180 M30 128 H180" />
      <rect x="78" y="104" width="54" height="20" rx="3" fill="var(--paper-0)" />
      <text x="105" y="118" text-anchor="middle">× {{ count() }}</text>
    </svg>
    <p>{{ text() }}</p>
  `,
  styleUrl: './stock-crate.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockCrate {
  /** Shown on the crate's label ("× 24"). */
  readonly count = input<string | number>('');
  readonly text = input('');
}
