import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { VdButton } from '../../../../shared/components/ui';
import { formatDateTime } from '../../../../shared/utils/format';
import {
  diffKind,
  formatCash,
  formatDuration,
  formatSigned,
  shiftDiff,
  ShiftListItem,
} from '../../shifts.models';

/**
 * Shifts as a table: terminal, cashier, opened / closed, sales and the cash
 * difference, with a link to each shift's page. Used by Shift history and
 * by an employee's page (there without the cashier column).
 * Needs the "shifts" translations (provideTranslocoScope('shifts')).
 *
 * @example
 * <app-shift-table [shifts]="shifts()" [lang]="lang()" />
 * <app-shift-table [shifts]="shifts()" [lang]="lang()" hideCashier />
 */
@Component({
  selector: 'app-shift-table',
  imports: [RouterLink, TranslocoDirective, VdButton],
  templateUrl: './shift-table.html',
  styleUrl: './shift-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShiftTable {
  readonly shifts = input.required<ShiftListItem[]>();
  readonly lang = input.required<string>();
  readonly hideCashier = input(false, { transform: booleanAttribute });

  protected readonly cash = formatCash;
  protected readonly dateTime = formatDateTime;

  protected readonly rows = computed(() =>
    this.shifts().map((s) => {
      const diff = shiftDiff(s);
      return {
        ...s,
        diff,
        kind: diff === null ? null : diffKind(diff),
        signed: diff === null ? '' : formatSigned(diff),
        duration: s.closedAt ? formatDuration(s.openedAt, s.closedAt) : '',
      };
    }),
  );
}
