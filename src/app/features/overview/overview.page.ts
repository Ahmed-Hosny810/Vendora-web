import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideMonitor } from '@lucide/angular';

import { LanguageService } from '../../core/i18n';
import { AppSession, SetupTask } from '../../core/session';
import { KpiCard } from '../../shared/components/app';
import { AppShell } from '../../layouts/app-layout/app-shell';
import { VdButton } from '../../shared/components/ui';
import { formatDateTime } from '../../shared/utils/format';
import {
  diffKind,
  formatCash,
  formatSigned,
  shiftDiff,
  ShiftListItem,
} from '../shifts/shifts.models';
import { SetupChecklist } from './components/setup-checklist/setup-checklist';

/**
 * Home of the signed-in app.
 *  - Owners and admins: greeting, setup checklist, plan + help cards, three KPI tiles.
 *  - Cashiers: greeting, "Ready when you are" card with Open POS, last shift.
 */
@Component({
  selector: 'app-overview-page',
  imports: [RouterLink, TranslocoDirective, VdButton, KpiCard, SetupChecklist, LucideMonitor],
  templateUrl: './overview.page.html',
  styleUrl: './overview.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTranslocoScope('overview')],
})
export class OverviewPage {
  protected readonly session = inject(AppSession);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly cash = formatCash;
  protected readonly dateTime = formatDateTime;

  // ---------- Set by your logic ----------
  /** Today's sales, already formatted (e.g. "1,250.00 EGP"), or null before the first sale. */
  protected readonly salesToday = signal<string | null>(null);
  protected readonly openShifts = signal<number>(0);
  /** Items at or under their low-stock level, or null before stock is counted. */
  protected readonly lowStock = signal<number | null>(null);
  /** Current plan's name, for the "Your plan" card. */
  protected readonly planName = signal<string | null>(null);
  /** The setup task finished most recently (its DONE stamp bounces in). */
  protected readonly justDone = signal<SetupTask | null>(null);
  /** Cashier: the terminal they'll open a shift on. */
  protected readonly terminalName = signal<string | null>(null);
  /** Cashier: their most recent shift, or null before their first one. */
  protected readonly lastShift = signal<ShiftListItem | null>(null);

  /** The last shift's cash difference: kind and "+20.00" / "−40.00". */
  protected readonly lastDiff = computed(() => {
    const s = this.lastShift();
    const diff = s ? shiftDiff(s) : null;
    return diff === null ? null : { kind: diffKind(diff), signed: formatSigned(diff) };
  });

  protected readonly firstName = computed(() => this.session.user()?.name.split(/\s+/)[0] ?? '');
  protected readonly anyDone = computed(() => this.session.setupDone().size > 0);
  protected readonly setupComplete = computed(
    () => this.session.setupDone().size >= this.session.setupTotal,
  );

  /** "Good morning / afternoon / evening" by the local hour. */
  protected readonly dayPart = (() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  })();

  constructor() {
    inject(AppShell).setTitle('overview');
    // TODO(you): load the overview numbers (sales today, open shifts, low stock),
    //  the plan name, and the finished setup tasks (this.session.setupDone.set(...)).
    //  Cashiers: their terminal (this.terminalName) and last shift (this.lastShift).
  }
}
