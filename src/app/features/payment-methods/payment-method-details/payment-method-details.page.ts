import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
  LucideBanknote,
  LucideCreditCard,
  LucidePencil,
  LucideReceiptText,
  LucideWallet,
} from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { KpiCard, LoadError } from '../../../shared/components/app';
import {
  ConfirmDialogData,
  injectDrawer,
  VdButton,
  VdConfirmDialog,
} from '../../../shared/components/ui';
import { formatDateTime, formatMoney } from '../../../shared/utils/format';
import {
  PaymentMethodDrawer,
  PaymentMethodDrawerData,
} from '../components/payment-method-drawer/payment-method-drawer';
import {
  PaymentMethod,
  PaymentMethodForm,
  PaymentMethodStats,
  paymentIcon,
  PaymentRecord,
  PaymentSaveResult,
} from '../payment-methods.models';

/**
 * One payment method (/payment-methods/:id): its settings, how much it was
 * used in the last 30 days, and the latest payments taken with it.
 * Edit opens the same drawer as the list; it can also be turned off.
 */
@Component({
  selector: 'app-payment-method-details-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    KpiCard,
    LoadError,
    LucideBanknote,
    LucideCreditCard,
    LucidePencil,
    LucideReceiptText,
    LucideWallet,
  ],
  templateUrl: './payment-method-details.page.html',
  styleUrl: './payment-method-details.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/payment-methods/<lang>.json (keys start with "paymentMethods.").
  providers: [provideTranslocoScope('payment-methods')],
})
export class PaymentMethodDetailsPage {
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly dateTime = formatDateTime;
  /** From the URL: /payment-methods/<id>. */
  protected readonly methodId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly shell = inject(AppShell);
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);
  private readonly transloco = inject(TranslocoService);
  private readonly openDrawer = injectDrawer();

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly method = signal<PaymentMethod | null>(null);
  protected readonly stats = signal<PaymentMethodStats | null>(null);
  /** Newest first, up to 20. */
  protected readonly payments = signal<PaymentRecord[]>([]);
  /** Turning it on or off. */
  protected readonly toggling = signal(false);

  protected readonly icon = computed(() => {
    const m = this.method();
    return m ? paymentIcon(m) : 'card';
  });
  protected readonly average = computed(() => {
    const s = this.stats();
    return s && s.count ? s.amount / s.count : null;
  });

  constructor() {
    this.shell.setPage({ key: 'pages.paymentMethod' }, [
      { key: 'nav.paymentMethods', link: '/payment-methods' },
      { key: 'pages.paymentMethod' },
    ]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the method this.methodId, its stats (last 30 days) and recent payments.
    //  - before: this.status.set('loading')
    //  - success: this.method.set(m); this.stats.set(s); this.payments.set(list);
    //             this.status.set('ready')
    //             and show its name in the top bar:
    //             this.shell.setPage({ text: m.name }, [
    //               { key: 'nav.paymentMethods', link: '/payment-methods' }, { text: m.name }])
    //  - not found / failure: this.status.set('error')
  }

  protected edit(): void {
    const method = this.method();
    if (!method) return;
    this.openDrawer<PaymentMethodForm, PaymentMethodDrawerData, PaymentMethodDrawer>(
      PaymentMethodDrawer,
      {
        data: { method, nextOrder: method.sortOrder, save: (value) => this.save(value) },
        injector: this.injector,
      },
    );
  }

  /** Called by the drawer's Save. Return what happened; the drawer shows it. */
  private async save(value: PaymentMethodForm): Promise<PaymentSaveResult> {
    // TODO(you): update the payment method this.methodId (same call as the list's save).
    //  - success: this.method.update((m) => m && { ...m, ...value }); toast "Payment method saved";
    //             return 'saved'
    //  - code already used: return 'codeTaken'
    //  - other failure: return 'failed'
    void value;
    return 'failed';
  }

  protected turnOff(): void {
    const name = this.method()?.name ?? '';
    const t = (key: string) => this.transloco.translate(`paymentMethods.details.${key}`, { name });
    this.dialog
      .open<boolean, ConfirmDialogData>(VdConfirmDialog, {
        injector: this.injector,
        data: {
          title: t('offTitle'),
          message: t('offText'),
          confirmText: t('offConfirm'),
          danger: true,
        },
      })
      .closed.subscribe((yes) => {
        if (!yes) return;
        // TODO(you): turn the method off.
        //  - before: this.toggling.set(true); after: this.toggling.set(false)
        //  - success: this.method.update((m) => m && { ...m, active: false })
        //  - failure: toast the error
      });
  }

  protected turnOn(): void {
    // TODO(you): turn the method back on (toggling like turnOff()), then
    //  this.method.update((m) => m && { ...m, active: true })
  }
}
