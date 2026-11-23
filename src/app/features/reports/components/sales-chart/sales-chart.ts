import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import {
  formatCompact,
  formatDate,
  formatDayMonth,
  formatMoney,
  formatWeekday,
} from '../../../../shared/utils/format';
import { ReportPeriod, ReportPoint } from '../../reports.models';

/** Rounds up to a tidy axis top (e.g. 52,000 → 60,000) so its half is tidy too. */
function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 1.2, 1.6, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * power >= value) ?? 10;
  return step * power;
}

/** "13:00" */
function hour(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Net sales as bars: by hour for today, by day for a week or a month.
 * One colour (one series), a tidy axis with three lines, the best bar
 * labelled, and a tooltip on hover. Screen readers get a table instead.
 *
 * @example
 * <app-sales-chart [points]="report.series" period="week" [lang]="lang()" />
 */
@Component({
  selector: 'app-sales-chart',
  imports: [TranslocoDirective],
  templateUrl: './sales-chart.html',
  styleUrl: './sales-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesChart {
  readonly points = input.required<ReportPoint[]>();
  readonly period = input.required<ReportPeriod>();
  readonly lang = input.required<string>();

  protected readonly money = formatMoney;
  /** The bar under the pointer. */
  protected readonly hover = signal<number | null>(null);

  protected readonly top = computed(() =>
    niceMax(Math.max(0, ...this.points().map((p) => p.amount))),
  );
  /** Axis labels, top to bottom. */
  protected readonly ticks = computed(() => {
    const top = this.top();
    return [top, top / 2, 0].map(formatCompact);
  });

  /** The tallest bar (gets its value written above it), or -1 when all are 0. */
  protected readonly peak = computed(() => {
    const amounts = this.points().map((p) => p.amount);
    const max = Math.max(0, ...amounts);
    return max > 0 ? amounts.indexOf(max) : -1;
  });

  protected readonly empty = computed(() => this.peak() === -1);

  protected readonly bars = computed(() => {
    const points = this.points();
    const top = this.top();
    const lang = this.lang();
    const period = this.period();
    // Phones fit about 8 labels under the chart: show every n-th one.
    const every = Math.max(1, Math.ceil(points.length / 8));
    return points.map((p, i) => ({
      ...p,
      // Small but non-zero days still get a visible sliver.
      height: p.amount > 0 ? Math.max(1.5, (p.amount / top) * 100) : 0,
      axis:
        i % every === 0
          ? period === 'today'
            ? hour(p.at)
            : period === 'week'
              ? formatWeekday(p.at, lang)
              : formatDayMonth(p.at, lang)
          : '',
      tip:
        period === 'today'
          ? `${hour(p.at)} – ${hour(new Date(p.at.getTime() + 3_600_000))}`
          : `${formatWeekday(p.at, lang)} ${formatDate(p.at, lang)}`,
      compact: formatCompact(p.amount),
      // Tooltips near the edges open inwards so they aren't cut off.
      edge: i < 2 ? 'start' : i > points.length - 3 ? 'end' : '',
    }));
  });
}
