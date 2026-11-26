import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleExclamationPoint,
  LucideInfo,
  LucidePhone,
  LucideSearch,
  LucideUserCheck,
  LucideX,
} from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { Customer, CustomerForm } from '../../pos.models';

export interface CustomerDrawerData {
  /** Find a customer by phone: the customer, null when none, or 'failed'. */
  lookup: (phone: string) => Promise<Customer | null | 'failed'>;
  /** Create a customer: the new customer, 'phoneTaken' or 'failed'. */
  save: (value: CustomerForm) => Promise<Customer | 'phoneTaken' | 'failed'>;
}

/**
 * Add customer, from the side: type a phone and find them. Not found?
 * Add them here, or skip — walk-in sales don't need a customer.
 * Closes with the customer to attach, or nothing.
 */
@Component({
  selector: 'app-customer-drawer',
  imports: [
    TranslocoDirective,
    FormField,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    LucideCircleExclamationPoint,
    LucideInfo,
    LucidePhone,
    LucideSearch,
    LucideUserCheck,
    LucideX,
  ],
  templateUrl: './customer-drawer.html',
  styleUrl: './customer-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDrawer {
  protected readonly data = inject<CustomerDrawerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<Customer>>(DialogRef);

  protected readonly phone = signal('');
  /** idle → searching → found / notFound (or failed). */
  protected readonly lookupStatus = signal<'idle' | 'searching' | 'found' | 'notFound' | 'failed'>(
    'idle',
  );
  protected readonly found = signal<Customer | null>(null);

  protected readonly saveStatus = signal<'idle' | 'saving' | 'failed'>('idle');
  protected readonly phoneTaken = signal(false);
  protected readonly saving = computed(() => this.saveStatus() === 'saving');

  protected readonly model = signal<CustomerForm>({
    fullName: '',
    phone: '',
    area: '',
    city: '',
    address: '',
    notes: '',
  });

  protected readonly customerForm = form(this.model, (f) => {
    validate(f.fullName, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.fullName, 150);
    validate(f.phone, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.phone, 30);
    maxLength(f.area, 100);
    maxLength(f.city, 100);
    maxLength(f.address, 300);
    maxLength(f.notes, 500);
  });

  protected readonly nameError = computed(() => {
    const field = this.customerForm.fullName();
    return field.touched() && field.invalid();
  });
  protected readonly phoneError = computed(() => {
    if (this.phoneTaken()) return 'phoneTaken';
    const field = this.customerForm.phone();
    return field.touched() && field.invalid() ? 'phoneRequired' : null;
  });

  protected onPhoneInput(value: string): void {
    this.phone.set(value);
    if (this.lookupStatus() !== 'idle') this.lookupStatus.set('idle');
  }

  protected async find(event?: Event): Promise<void> {
    event?.preventDefault();
    const phone = this.phone().trim();
    if (!phone || this.lookupStatus() === 'searching') return;
    this.lookupStatus.set('searching');
    const result = await this.data.lookup(phone);
    if (result === 'failed') {
      this.lookupStatus.set('failed');
    } else if (result) {
      this.found.set(result);
      this.lookupStatus.set('found');
    } else {
      this.model.update((m) => ({ ...m, phone }));
      this.lookupStatus.set('notFound');
    }
  }

  protected attach(customer: Customer): void {
    this.ref.close(customer);
  }

  protected async onSave(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.phoneTaken.set(false);
    await submit(this.customerForm, async () => {
      this.saveStatus.set('saving');
      const result = await this.data.save(this.model());
      if (result === 'failed') this.saveStatus.set('failed');
      else if (result === 'phoneTaken') {
        this.saveStatus.set('idle');
        this.phoneTaken.set(true);
      } else this.ref.close(result);
    });
  }
}
