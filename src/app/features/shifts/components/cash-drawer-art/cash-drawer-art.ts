import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A cash register on a dotted butter background. The tray slides out when
 * `open` turns true, and the screen shows `amount`. A caption sits below.
 */
@Component({
  selector: 'app-cash-drawer-art',
  template: `
    <svg viewBox="0 0 380 260" aria-hidden="true">
      <rect class="s3" x="40" y="40" width="300" height="110" rx="12" fill="var(--pine-700)" />
      <rect class="s3" x="70" y="60" width="240" height="60" rx="6" fill="var(--pine-100)" />
      <text x="190" y="98" text-anchor="middle">{{ amount() }}</text>
      <g class="tray" [class.is-open]="open()">
        <rect class="s3" x="30" y="150" width="320" height="76" rx="10" fill="var(--paper-0)" />
        <path class="s2" d="M94 150 V226 M158 150 V226 M222 150 V226 M286 150 V226" fill="none" />
        <rect class="s2" x="40" y="160" width="46" height="34" rx="3" fill="var(--pine-300)" />
        <rect class="s2" x="104" y="158" width="46" height="36" rx="3" fill="var(--butter-500)" />
        <rect class="s2" x="168" y="162" width="46" height="32" rx="3" fill="var(--pine-300)" />
        <g class="coins">
          <circle class="s2" cx="250" cy="180" r="12" fill="var(--butter-300)" />
          <circle class="s2" cx="268" cy="186" r="10" fill="var(--butter-500)" />
        </g>
        <circle class="s2" cx="318" cy="180" r="10" fill="var(--butter-300)" />
        <rect x="170" y="210" width="40" height="8" rx="4" fill="var(--pine-900)" />
      </g>
    </svg>
    <p aria-live="polite">{{ caption() }}</p>
  `,
  styleUrl: './cash-drawer-art.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashDrawerArt {
  /** Shown on the register's screen ("1,000.00"). */
  readonly amount = input('00.00');
  readonly open = input(false);
  readonly caption = input('');
}
