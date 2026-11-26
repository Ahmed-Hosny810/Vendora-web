import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  maxLength,
  pattern,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import {
  Branch,
  CODE_PATTERN,
  SaveResult,
  Terminal,
  TERMINAL_LIMITS,
  TerminalForm,
} from '../../branches.models';
import { TerminalDevice } from '../terminal-device/terminal-device';

export interface TerminalDrawerData {
  branches: Pick<Branch, 'id' | 'nameEn'>[];
  /** Preselected branch (the one being viewed). */
  branchId: string;
  /** Editing an existing terminal; leave out to add one. */
  terminal?: Terminal;
  /** Saves the form. The page passes its own method (your logic). */
  save: (value: TerminalForm) => Promise<SaveResult>;
}

/**
 * Add or edit a terminal, in a side drawer. Opened by the branch page with
 * injectDrawer(). Closes with the saved form value, or undefined if cancelled.
 */
@Component({
  selector: 'app-terminal-drawer',
  imports: [
    TranslocoDirective,
    FormField,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    TerminalDevice,
    LucideCheck,
    LucideCircleExclamationPoint,
    LucideX,
  ],
  templateUrl: './terminal-drawer.html',
  styleUrl: './terminal-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalDrawer {
  protected readonly data = inject<TerminalDrawerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<TerminalForm>>(DialogRef);
  protected readonly limits = TERMINAL_LIMITS;

  protected readonly model = signal<TerminalForm>({
    branchId: this.data.terminal?.branchId ?? this.data.branchId,
    name: this.data.terminal?.name ?? '',
    deviceCode: this.data.terminal?.deviceCode ?? '',
  });

  protected readonly terminalForm = form(this.model, (f) => {
    required(f.branchId);
    validate(f.name, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.name, TERMINAL_LIMITS.name);
    required(f.deviceCode);
    pattern(f.deviceCode, CODE_PATTERN);
    maxLength(f.deviceCode, TERMINAL_LIMITS.deviceCode);
  });

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  /** The server said this device code is already used. */
  protected readonly codeTaken = signal(false);
  protected readonly saving = computed(() => this.status() === 'saving');

  protected readonly branchName = computed(
    () => this.data.branches.find((b) => b.id === this.model().branchId)?.nameEn ?? '',
  );

  /** Error key under branches.terminal.errors, or null. */
  protected errorOf(field: 'name' | 'deviceCode'): string | null {
    const state = this.terminalForm[field]();
    if (field === 'deviceCode' && this.codeTaken()) return 'codeTaken';
    if (!state.touched() || !state.invalid()) return null;
    const kind = state.errors()[0].kind;
    return field === 'name' ? 'nameRequired' : kind === 'pattern' ? 'codeFormat' : 'codeRequired';
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.codeTaken.set(false);

    await submit(this.terminalForm, async () => {
      this.status.set('saving');
      const result = await this.data.save(this.model());
      if (result === 'saved') {
        this.ref.close(this.model());
        return;
      }
      this.status.set(result === 'codeTaken' ? 'idle' : 'failed');
      this.codeTaken.set(result === 'codeTaken');
    });
  }
}
