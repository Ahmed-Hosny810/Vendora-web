import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCircleExclamationPoint, LucideDownload } from '@lucide/angular';

/**
 * Picture of the sales dashboard: three figures, a 7-day bar chart,
 * payment split and a shift reconciliation with a difference.
 * The parent gives it role="img" and an aria-label describing it.
 */
@Component({
  selector: 'app-reports-screen',
  imports: [TranslocoDirective, LucideCircleExclamationPoint, LucideDownload],
  templateUrl: './reports-screen.html',
  styleUrl: './reports-screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsScreen {
  /** Daily sales in thousands of EGP, Saturday → Friday (Friday = today). */
  protected readonly days = [38.4, 31.2, 29.8, 33.5, 36.1, 44.9, 48.2];
  /** Tallest bar the chart can show, in thousands. */
  protected readonly chartMax = 50;

  protected readonly payments = [
    { key: 'cash', share: 46, amount: '22,186', color: 'var(--pine-600)' },
    { key: 'card', share: 38, amount: '18,327', color: 'var(--pine-300)' },
    { key: 'wallet', share: 16, amount: '7,717', color: 'var(--butter-500)' },
  ] as const;
}
