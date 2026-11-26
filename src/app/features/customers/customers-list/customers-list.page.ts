import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideSearch, LucideUserPlus, LucideUsers } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import { formatDate, formatMoney, initials } from '../../../shared/utils/format';
import {
  CustomerDrawerData,
  CustomerEditDrawer,
} from '../components/customer-drawer/customer-drawer';
import { CustomerForm, CustomerListItem, CustomerSaveResult } from '../customers.models';

/**
 * Customers (/customers): people attached to sales. Search by name or phone,
 * add one, open one to see their sales.
 */
@Component({
  selector: 'app-customers-list-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    LucideSearch,
    LucideUserPlus,
    LucideUsers,
  ],
  templateUrl: './customers-list.page.html',
  styleUrl: './customers-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/customers/<lang>.json (keys start with "customers.").
  providers: [provideTranslocoScope('customers')],
})
export class CustomersListPage {
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly date = formatDate;
  protected readonly initials = initials;

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly customers = signal<CustomerListItem[]>([]);
  /** Added last: its row flashes once. */
  protected readonly newId = signal<string | null>(null);

  /** TODO(you): with many customers, search on the server instead. */
  protected readonly query = signal('');
  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const digits = q.replace(/\D/g, '');
    return this.customers().filter(
      (c) =>
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        (digits.length > 0 && c.phone.replace(/\D/g, '').includes(digits)),
    );
  });

  constructor() {
    inject(AppShell).setPage({ key: 'nav.customers' }, [{ key: 'nav.customers' }]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the customers.
    //  - before: this.status.set('loading')
    //  - success: this.customers.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected add(): void {
    this.openDrawer<CustomerForm, CustomerDrawerData, CustomerEditDrawer>(CustomerEditDrawer, {
      data: { save: (value) => this.create(value) },
      injector: this.injector,
    });
  }

  /** Called by the drawer's Save. */
  protected async create(value: CustomerForm): Promise<CustomerSaveResult> {
    // TODO(you): create the customer.
    //  - success: add it to this.customers; this.newId.set(id); toast "Customer added"; return 'saved'
    //  - phone already used: return 'phoneTaken'
    //  - other failure: return 'failed'
    void value;
    return 'failed';
  }
}
