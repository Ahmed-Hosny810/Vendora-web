import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucidePencil, LucidePercent, LucidePlus } from '@lucide/angular';

import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import { CatalogSaveResult, TaxRate, TaxRateForm } from '../catalog.models';
import { CatalogTabs } from '../components/catalog-tabs/catalog-tabs';
import { TaxRateDrawer, TaxRateDrawerData } from '../components/tax-rate-drawer/tax-rate-drawer';

/**
 * Tax rates (/tax-rates): the rates the business is registered for.
 * Vendora doesn't suggest any. One rate is the default for new products.
 */
@Component({
  selector: 'app-tax-rates-page',
  imports: [
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    CatalogTabs,
    LucidePencil,
    LucidePercent,
    LucidePlus,
  ],
  templateUrl: './tax-rates.page.html',
  styleUrl: './tax-rates.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/catalog/<lang>.json (keys start with "catalog.").
  providers: [provideTranslocoScope('catalog')],
})
export class TaxRatesPage {
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly taxRates = signal<TaxRate[]>([]);
  /** The rate saved last: its row flashes once. */
  protected readonly newId = signal<string | null>(null);

  /** Default first, then highest rate first. */
  protected readonly rows = computed(() =>
    [...this.taxRates()].sort(
      (a, b) => Number(b.isDefault) - Number(a.isDefault) || b.rate - a.rate,
    ),
  );

  constructor() {
    inject(AppShell).setPage({ key: 'nav.taxRates' }, [
      { key: 'nav.products', link: '/products' },
      { key: 'nav.taxRates' },
    ]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the tax rates.
    //  - before: this.status.set('loading')
    //  - success: this.taxRates.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  /** "14.00%" */
  protected percent(rate: number): string {
    return (
      rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
    );
  }

  protected open(taxRate?: TaxRate): void {
    const data: TaxRateDrawerData = {
      taxRate,
      currentDefault: this.taxRates().find((r) => r.isDefault)?.name ?? null,
      save: (value) => this.save(value, taxRate),
    };
    this.openDrawer<TaxRateForm, TaxRateDrawerData, TaxRateDrawer>(TaxRateDrawer, {
      data,
      injector: this.injector,
    });
  }

  /** Called by the drawer's Save. Return what happened; the drawer shows it. */
  protected async save(value: TaxRateForm, existing?: TaxRate): Promise<CatalogSaveResult> {
    // TODO(you): create (or update `existing`) the tax rate.
    //  If value.isDefault, the API makes the others non-default: reload or update the list.
    //  - success: update this.taxRates; this.newId.set(id); toast "Tax rate saved"; return 'saved'
    //  - name already used: return 'duplicate'
    //  - other failure: return 'failed'
    void value;
    void existing;
    return 'failed';
  }
}
