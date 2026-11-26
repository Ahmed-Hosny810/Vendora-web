import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { SelectOption } from '../../products.models';

export interface QuickCategory {
  nameEn: string;
  nameAr: string;
  parentId: string;
}

export interface QuickCategoryData {
  categories: SelectOption[];
  /** Creates the category; resolves with its id, 'duplicate' or 'failed' (your logic). */
  create: (value: QuickCategory) => Promise<string | 'duplicate' | 'failed'>;
}

/**
 * "New category" from inside the product form. Closes with the new
 * category's id, which the form then selects.
 */
@Component({
  selector: 'app-quick-category-dialog',
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
  templateUrl: './quick-category-dialog.html',
  styleUrl: './quick-category-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickCategoryDialog {
  protected readonly data = inject<QuickCategoryData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<string>>(DialogRef);
  protected readonly maxName = 150;

  protected readonly model = signal<QuickCategory>({ nameEn: '', nameAr: '', parentId: '' });
  protected readonly categoryForm = form(this.model, (f) => {
    validate(f.nameEn, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.nameEn, 150);
    maxLength(f.nameAr, 150);
  });

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  protected readonly duplicate = signal(false);
  protected readonly saving = computed(() => this.status() === 'saving');
  protected readonly nameError = computed(() => {
    if (this.duplicate()) return 'duplicate';
    const field = this.categoryForm.nameEn();
    return field.touched() && field.invalid() ? 'nameRequired' : null;
  });

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.duplicate.set(false);
    await submit(this.categoryForm, async () => {
      this.status.set('saving');
      const result = await this.data.create(this.model());
      if (result === 'duplicate' || result === 'failed') {
        this.status.set(result === 'failed' ? 'failed' : 'idle');
        this.duplicate.set(result === 'duplicate');
        return;
      }
      this.ref.close(result);
    });
  }
}
