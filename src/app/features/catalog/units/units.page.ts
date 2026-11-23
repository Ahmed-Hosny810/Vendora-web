import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucidePencil, LucidePlus, LucideScale } from '@lucide/angular';

import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import { CatalogSaveResult, Unit, UnitForm } from '../catalog.models';
import { CatalogTabs } from '../components/catalog-tabs/catalog-tabs';
import { UnitDrawer, UnitDrawerData } from '../components/unit-drawer/unit-drawer';

/**
 * Units (/units): how each product is counted (piece, meter, kilogram).
 * Add/Edit opens a side drawer.
 */
@Component({
  selector: 'app-units-page',
  imports: [
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    CatalogTabs,
    LucidePencil,
    LucidePlus,
    LucideScale,
  ],
  templateUrl: './units.page.html',
  styleUrl: '../catalog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/catalog/<lang>.json (keys start with "catalog.").
  providers: [provideTranslocoScope('catalog')],
})
export class UnitsPage {
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly units = signal<Unit[]>([]);
  /** The unit saved last: its row flashes once. */
  protected readonly newId = signal<string | null>(null);

  protected readonly rows = computed(() =>
    [...this.units()].sort((a, b) => a.name.localeCompare(b.name)),
  );

  constructor() {
    inject(AppShell).setPage({ key: 'nav.units' }, [
      { key: 'nav.products', link: '/products' },
      { key: 'nav.units' },
    ]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the units.
    //  - before: this.status.set('loading')
    //  - success: this.units.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected open(unit?: Unit): void {
    const data: UnitDrawerData = { unit, save: (value) => this.save(value, unit) };
    this.openDrawer<UnitForm, UnitDrawerData, UnitDrawer>(UnitDrawer, {
      data,
      injector: this.injector,
    });
  }

  /** Called by the drawer's Save. Return what happened; the drawer shows it. */
  protected async save(value: UnitForm, existing?: Unit): Promise<CatalogSaveResult> {
    // TODO(you): create (or update `existing`) the unit.
    //  - success: update this.units; this.newId.set(id); toast "Unit saved"; return 'saved'
    //  - symbol already used: return 'duplicate'
    //  - other failure: return 'failed'
    //  If products already use this unit, the API may refuse changing allowFractions.
    void value;
    void existing;
    return 'failed';
  }
}
