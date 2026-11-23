import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { CUSTOMER_LIMITS, CustomerForm, CustomerSaveResult } from '../../customers.models';

export interface CustomerDrawerData {
  /** Editing: the current values. */
  customer?: CustomerForm;
  save: (value: CustomerForm) => Promise<CustomerSaveResult>;
}

/** Add or edit a customer, in a side drawer. Only name and phone are required. */
@Component({
  selector: 'app-customer-edit-drawer',
  imports: [
    TranslocoDirective,
    FormField,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    LucideCheck,
    LucideCircleExclamationPoint,
    LucideX,
  ],
  templateUrl: './customer-drawer.html',
  styleUrl: './customer-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerEditDrawer {
  protected readonly data = inject<CustomerDrawerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<CustomerForm>>(DialogRef);
  protected readonly limits = CUSTOMER_LIMITS;

  protected readonly model = signal<CustomerForm>(
    this.data.customer ?? { fullName: '', phone: '', area: '', city: '', address: '', notes: '' },
  );

  protected readonly customerForm = form(this.model, (f) => {
    validate(f.fullName, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.fullName, CUSTOMER_LIMITS.fullName);
    validate(f.phone, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.phone, CUSTOMER_LIMITS.phone);
    maxLength(f.area, CUSTOMER_LIMITS.area);
    maxLength(f.city, CUSTOMER_LIMITS.city);
    maxLength(f.address, CUSTOMER_LIMITS.address);
    maxLength(f.notes, CUSTOMER_LIMITS.notes);
  });

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  protected readonly phoneTaken = signal(false);
  protected readonly saving = computed(() => this.status() === 'saving');

  protected readonly nameError = computed(() => {
    const field = this.customerForm.fullName();
    return field.touched() && field.invalid();
  });
  protected readonly phoneError = computed(() => {
    if (this.phoneTaken()) return 'phoneTaken';
    const field = this.customerForm.phone();
    return field.touched() && field.invalid() ? 'phoneRequired' : null;
  });

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.phoneTaken.set(false);
    await submit(this.customerForm, async () => {
      this.status.set('saving');
      const value = this.model();
      const trimmed: CustomerForm = {
        fullName: value.fullName.trim(),
        phone: value.phone.trim(),
        area: value.area.trim(),
        city: value.city.trim(),
        address: value.address.trim(),
        notes: value.notes.trim(),
      };
      const result = await this.data.save(trimmed);
      if (result === 'saved') {
        this.ref.close(trimmed);
        return;
      }
      this.status.set(result === 'phoneTaken' ? 'idle' : 'failed');
      this.phoneTaken.set(result === 'phoneTaken');
    });
  }
}
