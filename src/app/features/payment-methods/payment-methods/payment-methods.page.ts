import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideBanknote,
  LucideCreditCard,
  LucideGripVertical,
  LucidePencil,
  LucidePlus,
  LucideWallet,
} from '@lucide/angular';

import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import {
  PaymentMethodDrawer,
  PaymentMethodDrawerData,
} from '../components/payment-method-drawer/payment-method-drawer';
import { PaymentMethod, PaymentMethodForm, PaymentSaveResult } from '../payment-methods.models';

/**
 * Payment methods (/payment-methods): the ways customers can pay, in the
 * order cashiers see them. Drag the grip to reorder (or change "Sort order"
 * in the drawer, which also works with a keyboard).
 */
@Component({
  selector: 'app-payment-methods-page',
  imports: [
    TranslocoDirective,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    LucideBanknote,
    LucideCreditCard,
    LucideGripVertical,
    LucidePencil,
    LucidePlus,
    LucideWallet,
  ],
  templateUrl: './payment-methods.page.html',
  styleUrl: './payment-methods.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/payment-methods/<lang>.json (keys start with "paymentMethods.").
  providers: [provideTranslocoScope({ scope: 'payment-methods', alias: 'paymentMethods' })],
})
export class PaymentMethodsPage {
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly methods = signal<PaymentMethod[]>([]);
  /** The method saved last: its row flashes once. */
  protected readonly newId = signal<string | null>(null);

  /** In checkout order. */
  protected readonly rows = computed(() =>
    [...this.methods()].sort((a, b) => a.sortOrder - b.sortOrder),
  );

  constructor() {
    inject(AppShell).setPage({ key: 'nav.paymentMethods' }, [
      { key: 'nav.settings', link: '/settings' },
      { key: 'nav.paymentMethods' },
    ]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the payment methods.
    //  - before: this.status.set('loading')
    //  - success: this.methods.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  /** Which picture a method gets: cash, a wallet, or a card for the rest. */
  protected icon(m: PaymentMethod): 'cash' | 'wallet' | 'card' {
    if (m.isCash) return 'cash';
    return /wallet/i.test(`${m.name} ${m.code}`) ? 'wallet' : 'card';
  }

  protected open(method?: PaymentMethod): void {
    const last = this.rows().at(-1)?.sortOrder ?? 0;
    const data: PaymentMethodDrawerData = {
      method,
      nextOrder: last + 1,
      save: (value) => this.save(value, method),
    };
    this.openDrawer<PaymentMethodForm, PaymentMethodDrawerData, PaymentMethodDrawer>(
      PaymentMethodDrawer,
      { data, injector: this.injector },
    );
  }

  /** Called by the drawer's Save. Return what happened; the drawer shows it. */
  protected async save(
    value: PaymentMethodForm,
    existing?: PaymentMethod,
  ): Promise<PaymentSaveResult> {
    // TODO(you): create (or update `existing`) the payment method.
    //  - success: update this.methods; this.newId.set(id); toast "Payment method saved"; return 'saved'
    //  - code already used: return 'codeTaken'
    //  - other failure: return 'failed'
    void value;
    void existing;
    return 'failed';
  }

  /** A row was dropped in a new place: number them 1, 2, 3… in the new order. */
  protected drop(event: CdkDragDrop<PaymentMethod[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const list = [...this.rows()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    const reordered = list.map((m, i) => ({ ...m, sortOrder: i + 1 }));
    this.methods.set(reordered);
    // TODO(you): save the new order, e.g. reordered.map((m) => ({ id: m.id, sortOrder: m.sortOrder })).
    //  On failure: put the old list back (this.methods.set(old)) and toast an error.
  }
}
