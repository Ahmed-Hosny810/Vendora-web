import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideFolder, LucidePencil, LucidePlus } from '@lucide/angular';

import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import { CatalogSaveResult, Category, CategoryForm } from '../catalog.models';
import { CatalogTabs } from '../components/catalog-tabs/catalog-tabs';
import {
  CategoryDrawer,
  CategoryDrawerData,
  CategoryDrawerResult,
} from '../components/category-drawer/category-drawer';

/**
 * Categories (/categories): how products are grouped on the POS.
 * Add/Edit opens a side drawer.
 */
@Component({
  selector: 'app-categories-page',
  imports: [
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    CatalogTabs,
    LucideFolder,
    LucidePencil,
    LucidePlus,
  ],
  templateUrl: './categories.page.html',
  styleUrl: './categories.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/catalog/<lang>.json (keys start with "catalog.").
  providers: [provideTranslocoScope('catalog')],
})
export class CategoriesPage {
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly categories = signal<Category[]>([]);
  /** The category saved last: its row flashes once. */
  protected readonly newId = signal<string | null>(null);

  /**
   * Like a tree: each top-level category, then its children right under it.
   * Siblings: lowest sort order first, then by name.
   */
  protected readonly rows = computed(() => {
    const all = this.categories();
    const byId = new Map(all.map((c) => [c.id, c]));
    const order = (a: Category, b: Category) =>
      a.sortOrder - b.sortOrder || a.nameEn.localeCompare(b.nameEn);
    const rows: (Category & { parentName: string; depth: number })[] = [];
    const visit = (parentId: string | null, depth: number) => {
      for (const c of all.filter((x) => (x.parentId ?? null) === parentId).sort(order)) {
        rows.push({
          ...c,
          parentName: c.parentId ? (byId.get(c.parentId)?.nameEn ?? '') : '',
          depth,
        });
        if (depth < 5) visit(c.id, depth + 1);
      }
    };
    visit(null, 0);
    // Children whose parent isn't in the list still show, at the end.
    const shown = new Set(rows.map((r) => r.id));
    for (const c of all.filter((x) => !shown.has(x.id)).sort(order)) {
      rows.push({ ...c, parentName: byId.get(c.parentId ?? '')?.nameEn ?? '', depth: 0 });
    }
    return rows;
  });

  constructor() {
    inject(AppShell).setPage({ key: 'nav.categories' }, [
      { key: 'nav.products', link: '/products' },
      { key: 'nav.categories' },
    ]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the categories.
    //  - before: this.status.set('loading')
    //  - success: this.categories.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected open(category?: Category): void {
    const list = this.categories();
    const data: CategoryDrawerData = {
      categories: list,
      category,
      nextSortOrder: list.length ? Math.max(...list.map((c) => c.sortOrder)) + 1 : 0,
      save: (value) => this.save(value, category),
    };
    this.openDrawer<CategoryDrawerResult, CategoryDrawerData, CategoryDrawer>(CategoryDrawer, {
      data,
      injector: this.injector,
    }).closed.subscribe((result) => {
      if (result?.addProduct) {
        // TODO(you): go to Add product with this category picked:
        //  this.router.navigate(['/products/new'], { queryParams: { category: <new id> } })
      }
    });
  }

  /** Called by the drawer's Save. Return what happened; the drawer shows it. */
  protected async save(value: CategoryForm, existing?: Category): Promise<CatalogSaveResult> {
    // TODO(you): create (or update `existing`) the category. parentId '' means none (send null).
    //  - success: update this.categories; this.newId.set(id); toast "Category saved"; return 'saved'
    //  - name already used: return 'duplicate'
    //  - other failure: return 'failed'
    void value;
    void existing;
    return 'failed';
  }
}
