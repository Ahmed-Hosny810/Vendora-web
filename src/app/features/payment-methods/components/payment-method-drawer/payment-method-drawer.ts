import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, min, pattern, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideInfo, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import {
  PAYMENT_CODE_PATTERN,
  PAYMENT_LIMITS,
  PaymentMethod,
  PaymentMethodForm,
  PaymentSaveResult,
} from '../../payment-methods.models';

export interface PaymentMethodDrawerData {
  method?: PaymentMethod;
  /** Sort order for a new method (after the last one). */
  nextOrder: number;
  save: (value: PaymentMethodForm) => Promise<PaymentSaveResult>;
}

/** Add or edit a payment method, in a side drawer. */
@Component({
  selector: 'app-payment-method-drawer',
  imports: [
    TranslocoDirective,
    FormField,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    LucideCheck,
    LucideCircleExclamationPoint,
    LucideInfo,
    LucideX,
  ],
  templateUrl: './payment-method-drawer.html',
  styleUrl: './payment-method-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodDrawer {
  protected readonly data = inject<PaymentMethodDrawerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<PaymentMethodForm>>(DialogRef);
  protected readonly limits = PAYMENT_LIMITS;

  protected readonly model = signal<PaymentMethodForm>({
    name: this.data.method?.name ?? '',
    code: this.data.method?.code ?? '',
    isCash: this.data.method?.isCash ?? false,
    requiresReference: this.data.method?.requiresReference ?? false,
    sortOrder: this.data.method?.sortOrder ?? this.data.nextOrder,
  });

  protected readonly methodForm = form(this.model, (f) => {
    validate(f.name, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.name, PAYMENT_LIMITS.name);
    validate(f.code, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    pattern(f.code, PAYMENT_CODE_PATTERN);
    maxLength(f.code, PAYMENT_LIMITS.code);
    min(f.sortOrder, 0);
  });

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  protected readonly codeTaken = signal(false);
  protected readonly saving = computed(() => this.status() === 'saving');

  protected readonly nameError = computed(() => {
    const field = this.methodForm.name();
    return field.touched() && field.invalid();
  });
  /** Key under paymentMethods.drawer.errors, or null. */
  protected readonly codeError = computed(() => {
    if (this.codeTaken()) return 'codeTaken';
    const field = this.methodForm.code();
    if (!field.touched() || field.valid()) return null;
    return field.errors()[0]?.kind === 'required' ? 'codeRequired' : 'codePattern';
  });
  protected readonly orderError = computed(() => {
    const field = this.methodForm.sortOrder();
    return field.touched() && field.invalid();
  });

  /** Codes are shown in capitals everywhere, so save them that way. */
  protected upperCode(): void {
    this.model.update((m) => ({ ...m, code: m.code.trim().toUpperCase() }));
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.codeTaken.set(false);
    this.upperCode();
    await submit(this.methodForm, async () => {
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
