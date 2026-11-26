import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import {
  diffKind,
  expectedCash,
  formatCash,
  formatDayTime,
  formatSigned,
  ShiftSummary,
} from '../../shifts.models';

/** The printed shift summary (Z report) with a "CLOSED" stamp. It prints in on arrival. */
@Component({
  selector: 'app-shift-receipt',
  imports: [TranslocoDirective],
  templateUrl: './shift-receipt.html',
  styleUrl: './shift-receipt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Printing the page prints only this.
  host: { class: 'vd-print' },
})
export class ShiftReceipt {
  readonly summary = input.required<ShiftSummary>();
  readonly closedAt = input.required<Date>();
  readonly counted = input.required<number>();

  protected readonly cash = formatCash;
  protected readonly signed = formatSigned;
  protected readonly dayTime = formatDayTime;

  protected readonly expected = computed(() => expectedCash(this.summary()));
  protected readonly diff = computed(() => this.counted() - this.expected());
  protected readonly kind = computed(() => diffKind(this.diff()));
}
