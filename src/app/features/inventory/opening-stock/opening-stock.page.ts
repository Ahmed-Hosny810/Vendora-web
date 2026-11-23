import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { form, FormField, required, submit, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideCheck,
  LucideCircleExclamationPoint,
  LucideInfo,
  LucidePackage,
  LucidePlus,
} from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { FormSection, LoadError, PageHead } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { StepLine } from '../components/step-line/step-line';
import { StockCrate } from '../components/stock-crate/stock-crate';
import { OpeningStockForm, StockProduct } from '../inventory.models';

type Step = 'form' | 'review' | 'done';

/** Fields that can show an error (keys under inventory.opening.errors, except quantity). */
type FieldKey = 'branchId' | 'productId' | 'variantId' | 'quantity' | 'lowStockThreshold';

/**
 * Opening stock (/inventory/opening): the first count of one item at one branch.
 * Three steps on one page: the form (branch, item, quantities) → a review slip → saved.
 * Later changes to stock are adjustments, not opening stock.
 */
@Component({
  selector: 'app-opening-stock-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    FormField,
    VdButton,
    PageHead,
    FormSection,
    LoadError,
    StepLine,
    StockCrate,
    LucideArrowLeft,
    LucideArrowRight,
    LucideCheck,
    LucideCircleExclamationPoint,
    LucideInfo,
    LucidePackage,
    LucidePlus,
  ],
  templateUrl: './opening-stock.page.html',
  styleUrl: './opening-stock.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/inventory/<lang>.json (keys start with "inventory.").
  providers: [provideTranslocoScope('inventory')],
})
export class OpeningStockPage {
  protected readonly session = inject(AppSession);

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  /** Products that track inventory (with their variants). */
  protected readonly products = signal<StockProduct[]>([]);
  /** 'alreadyCounted' and 'failed' show a banner on the review step. */
  protected readonly saveStatus = signal<'idle' | 'saving' | 'alreadyCounted' | 'failed'>('idle');

  protected readonly step = signal<Step>('form');
  protected readonly tried = signal(false);

  protected readonly model = signal<OpeningStockForm>({
    branchId: this.session.branchId() ?? '',
    productId: '',
    variantId: '',
    quantity: 0,
    lowStockThreshold: 0,
  });

  /** The product picked in the form. */
  protected readonly product = computed(() =>
    this.products().find((p) => p.id === this.model().productId),
  );

  protected readonly stockForm = form(this.model, (f) => {
    required(f.branchId);
    required(f.productId);
    // Only needed when the product has variants.
    validate(f.variantId, ({ value }) =>
      this.product()?.variants.length && !value() ? { kind: 'required' } : null,
    );
    // More than 0; whole numbers unless the unit allows fractions.
    validate(f.quantity, ({ value }) => {
      const qty = value();
      if (!(qty > 0)) return { kind: 'min' };
      return this.wholeOnly() && !Number.isInteger(qty) ? { kind: 'whole' } : null;
    });
    // 0 or more (0 turns the warning off).
    validate(f.lowStockThreshold, ({ value }) => {
      const low = value();
      if (!(low >= 0)) return { kind: 'min' };
      return this.wholeOnly() && !Number.isInteger(low) ? { kind: 'whole' } : null;
    });
  });

  /** The picked product's unit can't be split (pieces, boxes…). */
  protected readonly wholeOnly = computed(() => !(this.product()?.allowFractions ?? false));

  /** Fields that show an error now (touched and invalid). */
  protected readonly errors = computed(() => {
    const keys: FieldKey[] = [
      'branchId',
      'productId',
      'variantId',
      'quantity',
      'lowStockThreshold',
    ];
    return keys.filter((key) => {
      const field = this.stockForm[key]();
      return field.touched() && field.invalid();
    });
  });

  /** "quantity" / "whole" for the two number fields' error text. */
  protected errorKind(key: 'quantity' | 'lowStockThreshold'): string {
    return this.stockForm[key]()
      .errors()
      .some((e) => e.kind === 'whole')
      ? 'whole'
      : key;
  }

  /** ① Select item until a product is picked, then ② Enter quantities. */
  protected readonly currentStep = computed(() => {
    switch (this.step()) {
      case 'form':
        return this.model().productId ? 2 : 1;
      case 'review':
        return 3;
      default:
        return 4;
    }
  });

  /** What the review slip and the success message show. */
  protected readonly summary = computed(() => {
    const m = this.model();
    const p = this.product();
    const variant = p?.variants.find((v) => v.id === m.variantId)?.name ?? '';
    return {
      branch: this.session.branches().find((b) => b.id === m.branchId)?.name ?? '',
      product: p?.name ?? '',
      variant,
      item: variant ? `${p?.name} · ${variant}` : (p?.name ?? ''),
      quantity: m.quantity,
      unit: p ? `${p.unitName} (${p.unitSymbol})` : '',
      unitSymbol: p?.unitSymbol ?? '',
      low: m.lowStockThreshold,
    };
  });

  constructor() {
    inject(AppShell).setPage({ key: 'pages.openingStock' }, [
      { key: 'nav.inventory', link: '/inventory' },
      { key: 'pages.openingStock' },
    ]);

    // Start on the branch picked in the top bar (it may load after this page).
    effect(() => {
      const branchId = this.session.branchId();
      if (branchId && !untracked(this.model).branchId) {
        this.model.update((m) => ({ ...m, branchId }));
      }
    });

    // A new product clears a variant that belongs to the old one.
    effect(() => {
      const variants = this.product()?.variants ?? [];
      const variantId = untracked(this.model).variantId;
      if (variantId && !variants.some((v) => v.id === variantId)) {
        this.model.update((m) => ({ ...m, variantId: '' }));
      }
    });

    this.load();
  }

  protected load(): void {
    // TODO(you): load the products that track inventory, each with its unit and variants.
    //  - before: this.status.set('loading')
    //  - success: this.products.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
    //  From a product page, ?product=<id> could preselect it:
    //  this.model.update((m) => ({ ...m, productId: id }))
  }

  protected hasError(key: FieldKey): boolean {
    return this.errors().includes(key);
  }

  /** "Review": check the form, then show the slip. */
  protected async toReview(event: Event): Promise<void> {
    event.preventDefault();
    this.tried.set(true);
    await submit(this.stockForm, async () => {
      this.saveStatus.set('idle');
      this.step.set('review');
      window.scrollTo({ top: 0 });
    });
    if (this.errors().length) {
      const first = {
        branchId: 'os-branch',
        productId: 'os-product',
        variantId: 'os-variant',
        quantity: 'os-qty',
        lowStockThreshold: 'os-low',
      }[this.errors()[0]];
      document.getElementById(first)?.focus();
    }
  }

  protected back(): void {
    this.step.set('form');
  }

  protected async confirm(): Promise<void> {
    if (this.saveStatus() === 'saving') return;
    // TODO(you): save the opening stock with this.model().
    //  - before: this.saveStatus.set('saving')
    //  - success: this.saveStatus.set('idle'); this.step.set('done')
    //             (and mark the 'stock' setup task done in AppSession.setupDone)
    //  - this item already has opening stock at this branch: this.saveStatus.set('alreadyCounted')
    //  - other failure: this.saveStatus.set('failed')
  }

  /** "Add another item": same branch, empty item and quantities. */
  protected addAnother(): void {
    this.stockForm().reset({
      branchId: this.model().branchId,
      productId: '',
      variantId: '',
      quantity: 0,
      lowStockThreshold: 0,
    });
    this.tried.set(false);
    this.saveStatus.set('idle');
    this.step.set('form');
  }
}
