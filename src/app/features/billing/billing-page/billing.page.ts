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
import {
  LucideArrowLeftRight,
  LucideCircleExclamationPoint,
  LucideExternalLink,
  LucideFileText,
  LucideTriangleAlert,
} from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError, PageHead, SkeletonRows } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import { formatDate, formatMoney, formatQty } from '../../../shared/utils/format';
import {
  BillingInvoice,
  BillingPlan,
  ChangePlanResult,
  PlanUsage,
  Subscription,
  USAGE_KEYS,
  usageLevel,
} from '../billing.models';
import {
  ChangePlanData,
  ChangePlanDrawer,
} from '../components/change-plan-drawer/change-plan-drawer';

/**
 * Billing (/billing), owners and admins: the current plan, how much of its
 * limits are used, and the invoices. Unpaid invoices are paid on Paymob's
 * page (no card form in Vendora).
 */
@Component({
  selector: 'app-billing-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PageHead,
    LoadError,
    SkeletonRows,
    LucideArrowLeftRight,
    LucideCircleExclamationPoint,
    LucideExternalLink,
    LucideFileText,
    LucideTriangleAlert,
  ],
  templateUrl: './billing.page.html',
  styleUrl: './billing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/billing/<lang>.json (keys start with "billing.").
  providers: [provideTranslocoScope('billing')],
})
export class BillingPage {
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly date = formatDate;
  protected readonly qty = formatQty;
  protected readonly usageKeys = USAGE_KEYS;
  protected readonly level = usageLevel;
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly subscription = signal<Subscription | null>(null);
  protected readonly usage = signal<PlanUsage>({ branches: 0, products: 0, cashiers: 0 });
  /** Newest first. */
  protected readonly invoices = signal<BillingInvoice[]>([]);
  /** Every plan the business can switch to (including the current one). */
  protected readonly plans = signal<BillingPlan[]>([]);
  /** The invoice whose Paymob page is opening. */
  protected readonly payingId = signal<string | null>(null);

  /** The oldest invoice still to pay: shown in the banner on top. */
  protected readonly due = computed(
    () => [...this.invoices()].reverse().find((inv) => inv.status !== 'paid') ?? null,
  );

  /** One row per limit: used, limit (null = unlimited), share for the bar, level. */
  protected readonly meters = computed(() => {
    const sub = this.subscription();
    if (!sub) return [];
    return USAGE_KEYS.map((key) => {
      const used = this.usage()[key];
      const limit = sub.plan.limits[key];
      return {
        key,
        used,
        limit,
        share: limit ? Math.min(100, (used / limit) * 100) : 0,
        level: usageLevel(used, limit),
      };
    });
  });

  constructor() {
    inject(AppShell).setTitle('billing');
    this.load();
  }

  protected load(): void {
    // TODO(you): load the subscription, usage counts, invoices and plans.
    //  - before: this.status.set('loading')
    //  - success: this.subscription.set(sub); this.usage.set(counts);
    //             this.invoices.set(list); this.plans.set(plans); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected pay(invoice: BillingInvoice): void {
    if (this.payingId()) return;
    // TODO(you): ask the API for the Paymob checkout link of this invoice, then open it
    //  (window.location.href = url). Same flow as the onboarding invoice.
    //  Paymob's return address for these payments: /billing/payment
    //  - before: this.payingId.set(invoice.id)
    //  - failure: this.payingId.set(null) and toast the error
    void invoice;
  }

  protected changePlan(): void {
    const sub = this.subscription();
    if (!sub) return;
    this.openDrawer<BillingPlan, ChangePlanData, ChangePlanDrawer>(ChangePlanDrawer, {
      data: {
        plans: this.plans(),
        currentId: sub.plan.id,
        usage: this.usage(),
        change: (plan) => this.saveChange(plan),
      },
      injector: this.injector,
    });
  }

  private async saveChange(plan: BillingPlan): Promise<ChangePlanResult> {
    // TODO(you): switch the subscription to plan.id, and return 'changed' or 'failed'.
    //  - success: reload (this.load()) and toast "You're now on {{plan}}"
    void plan;
    return 'failed';
  }
}
