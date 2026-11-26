import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  maxLength,
  min,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideLock, LucidePlus } from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { FormSection, PageHead } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { ImagePicker } from '../components/image-picker/image-picker';
import { ProductCardPreview } from '../components/product-card-preview/product-card-preview';
import {
  QuickCategory,
  QuickCategoryData,
  QuickCategoryDialog,
} from '../components/quick-category-dialog/quick-category-dialog';
import { ShelfTag } from '../components/shelf-tag/shelf-tag';
import { PRODUCT_LIMITS, ProductForm, SelectOption } from '../products.models';

const EMPTY_PRODUCT: ProductForm = {
  nameEn: '',
  nameAr: '',
  categoryId: '',
  unitId: '',
  sku: '',
  barcode: '',
  costPrice: 0,
  sellingPrice: 0,
  taxRateId: '',
  trackInventory: true,
};

/** Error keys under products.form.errors for the fields that can fail. */
type FieldKey = 'nameEn' | 'categoryId' | 'unitId' | 'taxRateId' | 'costPrice' | 'sellingPrice';

/**
 * Add a product (/products/new) or edit one (/products/:id/edit).
 * Five numbered sections; beside them, a swinging shelf tag and the POS card,
 * both live. Cost and margin are shown to owners and managers only.
 */
@Component({
  selector: 'app-product-form-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    FormField,
    VdButton,
    PageHead,
    FormSection,
    ImagePicker,
    ShelfTag,
    ProductCardPreview,
    LucideCheck,
    LucideCircleExclamationPoint,
    LucideLock,
    LucidePlus,
  ],
  templateUrl: './product-form.page.html',
  styleUrl: './product-form.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/products/<lang>.json (keys start with "products.").
  providers: [provideTranslocoScope('products')],
})
export class ProductFormPage {
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);
  protected readonly session = inject(AppSession);
  protected readonly limits = PRODUCT_LIMITS;

  /** Set when editing (/products/:id/edit). */
  protected readonly productId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  // ---------- Set by your logic ----------
  protected readonly categories = signal<SelectOption[]>([]);
  protected readonly units = signal<SelectOption[]>([]);
  /** Label like "Standard (14%)". */
  protected readonly taxRates = signal<SelectOption[]>([]);
  /** The business tracks inventory: the switch starts on (and says so). */
  protected readonly businessTracksInventory = signal(true);
  /** The saved image when editing. */
  protected readonly currentImageUrl = signal<string | null>(null);
  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  /** The SKU or barcode is already used by another product. */
  protected readonly duplicate = signal(false);

  /** The picked image: File = new, null = removed, undefined = unchanged. */
  protected readonly imageFile = signal<File | null | undefined>(undefined);
  /** Preview of the picked image for the POS card. */
  protected readonly imagePreview = signal<string | null>(null);

  protected readonly model = signal<ProductForm>({ ...EMPTY_PRODUCT });

  protected readonly productForm = form(this.model, (f) => {
    validate(f.nameEn, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.nameEn, PRODUCT_LIMITS.name);
    maxLength(f.nameAr, PRODUCT_LIMITS.name);
    required(f.categoryId);
    required(f.unitId);
    required(f.taxRateId);
    maxLength(f.sku, PRODUCT_LIMITS.sku);
    maxLength(f.barcode, PRODUCT_LIMITS.barcode);
    required(f.sellingPrice);
    min(f.sellingPrice, 0);
    required(f.costPrice);
    min(f.costPrice, 0);
  });

  protected readonly saving = computed(() => this.status() === 'saving');
  protected readonly tried = signal(false);

  /** Fields that show an error now (touched and invalid). */
  protected readonly errors = computed(() => {
    const keys: FieldKey[] = [
      'nameEn',
      'categoryId',
      'unitId',
      'costPrice',
      'sellingPrice',
      'taxRateId',
    ];
    return keys.filter((key) => {
      if (key === 'costPrice' && !this.session.isManager()) return false;
      const field = this.productForm[key]();
      return field.touched() && field.invalid();
    });
  });

  protected readonly categoryName = computed(
    () => this.categories().find((c) => c.id === this.model().categoryId)?.label ?? '',
  );

  constructor() {
    const page = this.productId ? 'pages.editProduct' : 'pages.addProduct';
    inject(AppShell).setPage({ key: page }, [
      { key: 'nav.products', link: '/products' },
      { key: page },
    ]);

    // TODO(you): load the categories, units and tax rates for the selects
    //  (preselect the default tax rate and, for a new product,
    //   trackInventory = whether the business tracks inventory).
    //  When editing, load the product: this.model.set({...}); this.currentImageUrl.set(url)
    //  From "Save and add product" on Categories, ?category=<id> can preselect the category.
  }

  protected hasError(key: FieldKey): boolean {
    return this.errors().includes(key);
  }

  protected onImage(file: File | null): void {
    const old = this.imagePreview();
    if (old) URL.revokeObjectURL(old);
    this.imageFile.set(file);
    this.imagePreview.set(file ? URL.createObjectURL(file) : null);
  }

  /** The POS card shows the newly picked image, else the saved one (unless removed). */
  protected readonly cardImage = computed(() => {
    if (this.imageFile() === null) return null;
    return this.imagePreview() ?? this.currentImageUrl();
  });

  protected openQuickCategory(): void {
    const data: QuickCategoryData = {
      categories: this.categories(),
      create: (value) => this.createCategory(value),
    };
    this.dialog
      .open<string, QuickCategoryData, QuickCategoryDialog>(QuickCategoryDialog, {
        data,
        injector: this.injector,
      })
      .closed.subscribe((id) => {
        if (id) this.model.update((m) => ({ ...m, categoryId: id }));
      });
  }

  /** Called by the "New category" dialog. Resolve with the new id, 'duplicate' or 'failed'. */
  protected async createCategory(value: QuickCategory): Promise<string | 'duplicate' | 'failed'> {
    // TODO(you): create the category (parentId '' = none), add it to this.categories,
    //  and return its id. Name already used: 'duplicate'. Other failure: 'failed'.
    void value;
    return 'failed';
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.tried.set(true);
    this.duplicate.set(false);

    await submit(this.productForm, async () => {
      // TODO(you): create (or update, if this.productId) the product with this.model(),
      //  then upload this.imageFile() if it's a File (or delete the image if it's null).
      //  - before: this.status.set('saving')
      //  - success: toast "Product saved", go to /products/<id>
      //  - SKU or barcode already used: this.status.set('idle'); this.duplicate.set(true)
      //  - other failure: this.status.set('failed')
    });

    if (this.errors().length) {
      const first = {
        nameEn: 'p-en',
        categoryId: 'p-cat',
        unitId: 'p-unit',
        costPrice: 'p-cost',
        sellingPrice: 'p-price',
        taxRateId: 'p-tax',
      }[this.errors()[0]];
      document.getElementById(first)?.focus();
    }
  }
}
