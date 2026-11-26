import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArrowRight,
  LucideCheck,
  LucideCircleExclamationPoint,
  LucideEqual,
  LucideMinus,
  LucidePlus,
  LucideX,
} from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { formatQty } from '../../../../shared/utils/format';
import {
  ADJUST_REASONS,
  AdjustForm,
  AdjustKind,
  AdjustResult,
  afterAdjust,
  StockItem,
} from '../../inventory.models';

export interface AdjustDrawerData {
  item: StockItem;
  branchName: string;
  save: (value: AdjustForm) => Promise<AdjustResult>;
}

/**
 * Adjust stock, in a side drawer: add (received), remove (damaged, lost…) or
 * set the counted amount, with a reason. Shows "12 pc → 15 pc" before saving.
 */
@Component({
  selector: 'app-adjust-drawer',
  imports: [
    TranslocoDirective,
    FormField,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    LucideArrowRight,
    LucideCheck,
    LucideCircleExclamationPoint,
    LucideEqual,
    LucideMinus,
    LucidePlus,
    LucideX,
  ],
  templateUrl: './adjust-drawer.html',
  styleUrl: './adjust-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdjustDrawer {
  protected readonly data = inject<AdjustDrawerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<AdjustForm>>(DialogRef);
  protected readonly qty = formatQty;
  protected readonly item = this.data.item;
  protected readonly kinds: AdjustKind[] = ['add', 'remove', 'set'];

  protected readonly model = signal<AdjustForm>({
    kind: 'add',
    quantity: 0,
    reason: 'received',
    note: '',
  });

  protected readonly adjustForm = form(this.model, (f) => {
    validate(f.quantity, ({ value, valueOf }) => {
      const q = value();
      const kind = valueOf(f.kind);
      if (!(kind === 'set' ? q >= 0 : q > 0)) return { kind: 'min' };
      if (!this.item.allowFractions && !Number.isInteger(q)) return { kind: 'whole' };
      return null;
    });
    validate(f.note, ({ value, valueOf }) =>
      valueOf(f.reason) === 'other' && !value().trim() ? { kind: 'required' } : null,
    );
    maxLength(f.note, 300);
  });

  protected readonly status = signal<'idle' | 'saving' | 'failed' | 'belowZero'>('idle');
  protected readonly saving = computed(() => this.status() === 'saving');
  protected readonly reasons = computed(() => ADJUST_REASONS[this.model().kind]);
  protected readonly after = computed(() =>
    afterAdjust(this.item.onHand, this.model().kind, this.model().quantity),
  );

  protected readonly qtyError = computed(() => {
    const field = this.adjustForm.quantity();
    if (!field.touched() || field.valid()) return null;
    return field.errors()[0]?.kind === 'whole'
      ? 'whole'
      : this.model().kind === 'set'
        ? 'minSet'
        : 'min';
  });
  protected readonly noteError = computed(() => {
    const field = this.adjustForm.note();
    return field.touched() && field.invalid();
  });

  protected setKind(kind: AdjustKind): void {
    this.model.update((m) => ({ ...m, kind, reason: ADJUST_REASONS[kind][0] }));
    if (this.status() === 'belowZero') this.status.set('idle');
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    await submit(this.adjustForm, async () => {
      this.status.set('saving');
      const value = { ...this.model(), note: this.model().note.trim() };
      const result = await this.data.save(value);
      if (result === 'saved') this.ref.close(value);
      else this.status.set(result);
    });
  }
}
