import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucidePencil, LucidePhone, LucideReceiptText } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { KpiCard, LoadError } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import { formatDate, formatDateTime, formatMoney, initials } from '../../../shared/utils/format';
import {
  CustomerDrawerData,
  CustomerEditDrawer,
} from '../components/customer-drawer/customer-drawer';
import {
  CustomerDetails,
  CustomerForm,
  CustomerSale,
  CustomerSaveResult,
} from '../customers.models';

/** One customer (/customers/:id): contact details, totals and their sales. */
@Component({
  selector: 'app-customer-details-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    LoadError,
    KpiCard,
    LucidePencil,
    LucidePhone,
    LucideReceiptText,
  ],
  templateUrl: './customer-details.page.html',
  styleUrl: './customer-details.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/customers/<lang>.json (keys start with "customers.").
  providers: [provideTranslocoScope('customers')],
})
export class CustomerDetailsPage {
  private readonly shell = inject(AppShell);
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly date = formatDate;
  protected readonly dateTime = formatDateTime;
  protected readonly initials = initials;

  protected readonly customerId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly customer = signal<CustomerDetails | null>(null);
  protected readonly sales = signal<CustomerSale[]>([]);

  protected readonly average = computed(() => {
    const c = this.customer();
    return c && c.salesCount ? c.totalSpent / c.salesCount : null;
  });

  constructor() {
    // Top bar: "Customers › Salma Hassan".
    effect(() => {
      const name = this.customer()?.fullName;
      const title = name ? { text: name } : { key: 'nav.customers' };
      this.shell.setPage(title, [{ key: 'nav.customers', link: '/customers' }, title]);
    });
    this.load();
  }

  protected load(): void {
    // TODO(you): load the customer (this.customerId) and their recent sales.
    //  - before: this.status.set('loading')
    //  - success: this.customer.set(c); this.sales.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected edit(): void {
    const c = this.customer();
    if (!c) return;
    const data: CustomerDrawerData = {
      customer: {
        fullName: c.fullName,
        phone: c.phone,
        area: c.area,
        city: c.city,
        address: c.address,
        notes: c.notes,
      },
      save: (value) => this.update(value),
    };
    this.openDrawer<CustomerForm, CustomerDrawerData, CustomerEditDrawer>(CustomerEditDrawer, {
      data,
      injector: this.injector,
    });
  }

  /** Called by the drawer's Save. */
  protected async update(value: CustomerForm): Promise<CustomerSaveResult> {
    // TODO(you): save the changes.
    //  - success: this.customer.update((c) => c && { ...c, ...value }); toast "Customer saved"; return 'saved'
    //  - phone already used: return 'phoneTaken'
    //  - other failure: return 'failed'
    void value;
    return 'failed';
  }
}
