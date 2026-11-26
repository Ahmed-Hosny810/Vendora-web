import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, FormField, maxLength, min, submit, validate } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { CATALOG_LIMITS, CatalogSaveResult, Category, CategoryForm } from '../../catalog.models';

export interface CategoryDrawerData {
  /** All categories, for the Parent select. */
  categories: Category[];
  /** Editing; leave out to add. */
  category?: Category;
  /** Suggested sort order for a new category (e.g. last + 1). */
  nextSortOrder: number;
  /** Saves the form. The page passes its own method (your logic). */
  save: (value: CategoryForm) => Promise<CatalogSaveResult>;
}

/** Closed with the saved value; `addProduct` = "Save and add product" was used. */
export interface CategoryDrawerResult {
  value: CategoryForm;
  addProduct: boolean;
}

/** Add or edit a category, in a side drawer. */
@Component({
  selector: 'app-category-drawer',
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
  templateUrl: './category-drawer.html',
  styleUrl: '../drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDrawer {
  protected readonly data = inject<CategoryDrawerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<CategoryDrawerResult>>(DialogRef);
  protected readonly maxName = CATALOG_LIMITS.categoryName;

  protected readonly model = signal<CategoryForm>({
    nameEn: this.data.category?.nameEn ?? '',
    nameAr: this.data.category?.nameAr ?? '',
    parentId: this.data.category?.parentId ?? '',
    sortOrder: this.data.category?.sortOrder ?? this.data.nextSortOrder,
    visible: this.data.category?.visible ?? true,
  });

  protected readonly categoryForm = form(this.model, (f) => {
    validate(f.nameEn, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.nameEn, CATALOG_LIMITS.categoryName);
    maxLength(f.nameAr, CATALOG_LIMITS.categoryName);
    min(f.sortOrder, 0);
  });

  /** A category can't be its own parent. */
  protected readonly parents = computed(() =>
    this.data.categories.filter((c) => c.id !== this.data.category?.id),
  );

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  protected readonly duplicate = signal(false);
  protected readonly saving = computed(() => this.status() === 'saving');

  protected readonly nameError = computed(() => {
    if (this.duplicate()) return 'duplicate';
    const field = this.categoryForm.nameEn();
    return field.touched() && field.invalid() ? 'nameRequired' : null;
  });
  protected readonly sortError = computed(() => {
    const field = this.categoryForm.sortOrder();
    return field.touched() && field.invalid();
  });

  protected async save(addProduct: boolean): Promise<void> {
    if (this.saving()) return;
    this.duplicate.set(false);
    await submit(this.categoryForm, async () => {
      this.status.set('saving');
      const result = await this.data.save(this.model());
      if (result === 'saved') {
        this.ref.close({ value: this.model(), addProduct });
        return;
      }
      this.status.set(result === 'duplicate' ? 'idle' : 'failed');
      this.duplicate.set(result === 'duplicate');
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void this.save(false);
  }
}
