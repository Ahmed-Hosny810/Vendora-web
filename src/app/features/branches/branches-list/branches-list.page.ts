import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleExclamationPoint,
  LucidePencil,
  LucidePlus,
  LucideRefreshCw,
  LucideSearch,
  LucideTriangleAlert,
} from '@lucide/angular';

import { AppShell } from '../../../layouts/app-layout/app-shell';
import { PageHead } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { Branch } from '../branches.models';
import { BranchShop } from '../components/branch-shop/branch-shop';

type StatusFilter = 'all' | 'active' | 'inactive';

/**
 * Branches list: search, Active/Inactive chips, and a table with View/Edit.
 *  - loading: skeleton rows
 *  - empty:   a blank storefront with "Add your first branch"
 *  - limit:   the plan's branch limit is used up (Add branch disabled, banner)
 *  - error:   couldn't load + Try again
 */
@Component({
  selector: 'app-branches-list-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PageHead,
    BranchShop,
    LucideCircleExclamationPoint,
    LucidePencil,
    LucidePlus,
    LucideRefreshCw,
    LucideSearch,
    LucideTriangleAlert,
  ],
  templateUrl: './branches-list.page.html',
  styleUrl: './branches-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/branches/<lang>.json (keys start with "branches.").
  providers: [provideTranslocoScope('branches')],
})
export class BranchesListPage {
  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly branches = signal<Branch[]>([]);
  /** Branches allowed by the plan, or null when there's no limit. */
  protected readonly planLimit = signal<number | null>(null);

  // ---------- Search and filter (on the loaded list) ----------
  protected readonly query = signal('');
  protected readonly filter = signal<StatusFilter>('all');
  protected readonly filters: StatusFilter[] = ['all', 'active', 'inactive'];

  protected readonly counts = computed(() => {
    const list = this.branches();
    const active = list.filter((b) => b.active).length;
    return { all: list.length, active, inactive: list.length - active };
  });

  /** Main branch first, then by name. */
  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return this.branches()
      .filter((b) => f === 'all' || b.active === (f === 'active'))
      .filter(
        (b) =>
          !q || [b.nameEn, b.nameAr, b.code, b.city].some((text) => text.toLowerCase().includes(q)),
      )
      .sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.nameEn.localeCompare(b.nameEn));
  });

  /** Active branches count toward the plan. TODO(you): confirm with the API. */
  protected readonly limitReached = computed(() => {
    const limit = this.planLimit();
    return limit !== null && this.counts().active >= limit;
  });

  constructor() {
    inject(AppShell).setPage({ key: 'nav.branches' }, [{ key: 'nav.branches' }]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the branches (and the plan's branch limit).
    //  - before the request: this.status.set('loading')
    //  - success: this.branches.set(list); this.planLimit.set(limit); this.status.set('ready')
    //  - failure: this.status.set('error')
  }
}
