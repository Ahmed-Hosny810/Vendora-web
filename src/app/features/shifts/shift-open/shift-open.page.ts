import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { form, FormField, required, submit, validate } from '@angular/forms/signals';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideArchive, LucideArrowRight, LucideCircleExclamationPoint } from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { PosShell } from '../../../layouts/pos-layout/pos-shell';
import { LoadError } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { CashDrawerArt } from '../components/cash-drawer-art/cash-drawer-art';
import { formatCash, formatTime, OpenShift, OpenShiftForm, ShiftTerminal } from '../shifts.models';

/**
 * Open shift (/pos/shift/open): pick the branch and terminal, count the
 * opening cash, open the drawer. If this cashier already has a shift open,
 * the page offers to continue it instead (only one at a time).
 */
@Component({
  selector: 'app-shift-open-page',
  imports: [
    NgTemplateOutlet,
    TranslocoDirective,
    FormField,
    VdButton,
    LoadError,
    CashDrawerArt,
    LucideArchive,
    LucideArrowRight,
    LucideCircleExclamationPoint,
  ],
  templateUrl: './shift-open.page.html',
  styleUrl: './shift-open.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/shifts/<lang>.json (keys start with "shifts.").
  providers: [provideTranslocoScope('shifts')],
})
export class ShiftOpenPage {
  protected readonly session = inject(AppSession);
  private readonly pos = inject(PosShell);
  protected readonly cash = formatCash;
  protected readonly time = formatTime;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  /** Active terminals of the branches this cashier can use. */
  protected readonly terminals = signal<ShiftTerminal[]>([]);
  /** This cashier's shift that is still open (shows "Pick up where you left off"). */
  protected readonly openShift = signal<OpenShift | null>(null);
  /** A branch that turned inactive and was taken out of the list (shows a banner). */
  protected readonly removedBranch = signal<string | null>(null);
  protected readonly openStatus = signal<'idle' | 'opening' | 'failed'>('idle');
  /** The cashier whose shift uses the chosen terminal ("Hana Nabil"). */
  protected readonly terminalBusyBy = signal<string | null>(null);

  protected readonly model = signal<OpenShiftForm>({
    branchId: this.session.branchId() ?? '',
    terminalId: '',
    openingCash: 0,
  });

  protected readonly shiftForm = form(this.model, (f) => {
    required(f.branchId);
    required(f.terminalId);
    validate(f.openingCash, ({ value }) => (value() >= 0 ? null : { kind: 'min' }));
  });

  /** Only terminals at the chosen branch. */
  protected readonly branchTerminals = computed(() =>
    this.terminals().filter((x) => x.branchId === this.model().branchId),
  );

  protected readonly opening = computed(() => this.openStatus() === 'opening');

  /** The chosen terminal's name ("Main Counter"). */
  protected readonly terminalLabel = computed(
    () => this.terminals().find((x) => x.id === this.model().terminalId)?.name ?? '',
  );

  /** "YS" */
  protected readonly initials = computed(() => {
    const parts = (this.session.user()?.name ?? '').trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)![0] : '')).toUpperCase();
  });

  /** Field errors to show (touched and invalid), or the busy terminal. */
  protected readonly errors = computed(() => {
    const shown = (key: keyof OpenShiftForm) => {
      const field = this.shiftForm[key]();
      return field.touched() && field.invalid();
    };
    return {
      branchId: shown('branchId'),
      terminalId: shown('terminalId') || !!this.terminalBusyBy(),
      openingCash: shown('openingCash'),
    };
  });

  /** The register's screen: "00.00" until the drawer opens. */
  protected readonly drawerAmount = computed(() => {
    const shift = this.openShift();
    if (shift) return formatCash(shift.openingCash);
    if (this.opening()) return formatCash(this.model().openingCash);
    return '00.00';
  });

  constructor() {
    // Start on the branch picked for this device (it may load after this page).
    effect(() => {
      const branchId = this.session.branchId();
      if (branchId && !untracked(this.model).branchId) {
        this.model.update((m) => ({ ...m, branchId }));
      }
    });

    // A new branch: keep the terminal only if it's there; pick it if it's the only one.
    effect(() => {
      const list = this.branchTerminals();
      const current = untracked(this.model).terminalId;
      if (list.some((x) => x.id === current)) return;
      const next = list.length === 1 ? list[0].id : '';
      if (next !== current) this.model.update((m) => ({ ...m, terminalId: next }));
    });

    // Choosing another terminal clears the "in use" error.
    let lastTerminal = this.model().terminalId;
    effect(() => {
      const terminalId = this.model().terminalId;
      if (terminalId === lastTerminal) return;
      lastTerminal = terminalId;
      untracked(() => this.terminalBusyBy.set(null));
    });

    // The POS bar shows the terminal, and the shift once one is open.
    effect(() => {
      const shift = this.openShift();
      const terminal = this.terminals().find((x) => x.id === this.model().terminalId);
      this.pos.terminalName.set(shift?.terminalName ?? terminal?.name ?? null);
      this.pos.shift.set(shift ? { openedAt: shift.openedAt, closed: false } : null);
    });

    this.load();
  }

  protected load(): void {
    // TODO(you): load this cashier's open shift (if any) and the active terminals.
    //  - before: this.status.set('loading')
    //  - success: this.openShift.set(shift ?? null); this.terminals.set(list);
    //             if a branch was dropped for being inactive: this.removedBranch.set(name);
    //             this.status.set('ready')
    //  - failure: this.status.set('error')
    //  You can prefill the opening cash, e.g. with the last closing count:
    //  this.model.update((m) => ({ ...m, openingCash: 1000 }))
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.opening()) return;
    await submit(this.shiftForm, async () => {
      // TODO(you): open the shift with this.model().
      //  - before: this.openStatus.set('opening')
      //  - success: this.pos.shift.set({ openedAt, closed: false }); go to the POS (/pos)
      //  - terminal in use: this.openStatus.set('idle'); this.terminalBusyBy.set(cashierName)
      //  - other failure: this.openStatus.set('failed')
    });
    const first = (['branchId', 'terminalId', 'openingCash'] as const).find(
      (k) => this.errors()[k],
    );
    if (first) document.getElementById(`so-${first}`)?.focus();
  }

  protected continueShift(): void {
    // TODO(you): go to the POS (/pos) with this.openShift().
  }
}
