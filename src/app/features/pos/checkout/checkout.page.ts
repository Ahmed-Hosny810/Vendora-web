import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArrowLeft,
  LucideBanknote,
  LucideCheck,
  LucideCircleCheck,
  LucideCircleExclamationPoint,
  LucideCreditCard,
  LucideDelete,
  LucideHistory,
  LucideInfo,
  LucideLock,
  LucidePlus,
  LucideRefreshCw,
  LucideTriangleAlert,
  LucideWallet,
} from '@lucide/angular';

import { LoadError } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { PosCart } from '../pos-cart';
import {
  cashSuggestions,
  CheckoutMethod,
  CheckoutPayment,
  formatMoney,
  lineTotals,
  methodKind,
  round2,
} from '../pos.models';

type Step = 'pay' | 'recording' | 'recovery';

/**
 * Checkout (/pos/checkout): the sale on the left, how it's paid on the right.
 * Cash has a keypad, quick amounts and the change to give. Card and wallet
 * need the amount and the reference from the machine or app. Several methods
 * can share one sale (split). While a payment is being recorded the buttons
 * lock, and if completing fails the cashier sees what's already paid.
 */
@Component({
  selector: 'app-checkout-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    LoadError,
    LucideArrowLeft,
    LucideBanknote,
    LucideCheck,
    LucideCircleCheck,
    LucideCircleExclamationPoint,
    LucideCreditCard,
    LucideDelete,
    LucideHistory,
    LucideInfo,
    LucideLock,
    LucidePlus,
    LucideRefreshCw,
    LucideTriangleAlert,
    LucideWallet,
  ],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/pos/<lang>.json (keys start with "pos.").
  providers: [provideTranslocoScope('pos')],
})
export class CheckoutPage {
  private readonly router = inject(Router);
  protected readonly cart = inject(PosCart);
  protected readonly money = formatMoney;
  protected readonly kindOf = methodKind;
  protected readonly lineNet = (l: Parameters<typeof lineTotals>[0]) => lineTotals(l).net;
  protected readonly keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  /** Active payment methods, in their sort order. */
  protected readonly methods = signal<CheckoutMethod[]>([]);

  // ---------- Checkout on screen ----------
  protected readonly payments = signal<CheckoutPayment[]>([]);
  protected readonly methodId = signal('');
  protected readonly step = signal<Step>('pay');
  /** The payment being recorded right now (shown with a spinner). */
  protected readonly pending = signal<CheckoutPayment | null>(null);
  /** Completing the sale after the last payment. */
  protected readonly completing = signal(false);
  protected readonly payFailed = signal(false);

  /** What the cashier typed: cash received, or a card/wallet amount. */
  protected readonly amountText = signal('');
  protected readonly reference = signal('');
  protected readonly tried = signal(false);

  protected readonly total = computed(() => this.cart.totals().total);
  protected readonly paid = computed(() =>
    round2(this.payments().reduce((s, p) => s + p.amount, 0)),
  );
  protected readonly left = computed(() => Math.max(0, round2(this.total() - this.paid())));

  protected readonly method = computed(() => this.methods().find((m) => m.id === this.methodId()));
  protected readonly isCash = computed(() => this.method()?.isCash ?? false);
  protected readonly amount = computed(() => {
    const n = Number(this.amountText());
    return Number.isFinite(n) ? round2(n) : 0;
  });

  // ----- Cash -----
  protected readonly suggestions = computed(() => cashSuggestions(this.left()));
  protected readonly change = computed(() => Math.max(0, round2(this.amount() - this.left())));
  /** Enough cash to finish the sale. */
  protected readonly cashCovers = computed(() => this.amount() > 0 && this.amount() >= this.left());
  /** Less than what's left: record it and pay the rest another way. */
  protected readonly canSplitCash = computed(
    () => this.amount() > 0 && this.amount() < this.left(),
  );

  // ----- Card / wallet -----
  protected readonly amountError = computed(() => {
    if (!this.tried()) return null;
    if (!(this.amount() > 0)) return 'amountMin';
    return this.amount() > this.left() ? 'amountMax' : null;
  });
  protected readonly referenceError = computed(
    () => this.tried() && !!this.method()?.requiresReference && !this.reference().trim(),
  );

  protected readonly locked = computed(() => this.step() !== 'pay');

  constructor() {
    // Start on the first method (Cash).
    effect(() => {
      const list = this.methods();
      if (list.length && !this.methodId()) this.choose(list[0].id);
    });
    this.load();
  }

  protected load(): void {
    // TODO(you): load the active payment methods (sorted).
    //  - before: this.status.set('loading')
    //  - success: this.methods.set(list); this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  protected choose(id: string): void {
    if (this.locked()) return;
    this.methodId.set(id);
    this.tried.set(false);
    this.reference.set('');
    this.payFailed.set(false);
    // Card and wallet start on what's left; cash starts empty.
    const m = this.methods().find((x) => x.id === id);
    this.amountText.set(m && !m.isCash && this.left() > 0 ? this.left().toFixed(2) : '');
  }

  /** Keeps only digits and one dot with up to 2 decimals. */
  protected onAmount(value: string): void {
    this.amountText.set(clean(value));
  }

  protected press(key: string): void {
    if (this.locked()) return;
    const text = this.amountText();
    this.amountText.set(key === 'back' ? text.slice(0, -1) : clean(text + key));
  }

  protected setAmount(value: number): void {
    this.amountText.set(value.toFixed(2).replace(/\.00$/, ''));
  }

  // ---------- Recording ----------

  /** Cash: `complete` uses what covers the sale; otherwise records part and stays. */
  protected recordCash(complete: boolean): void {
    const m = this.method();
    if (!m || this.locked()) return;
    if (complete ? !this.cashCovers() : !this.canSplitCash()) return;
    const received = this.amount();
    const amount = complete ? this.left() : received;
    this.record({
      methodId: m.id,
      name: m.name,
      amount,
      received,
      change: complete ? this.change() : 0,
      reference: '',
    });
  }

  protected recordOther(): void {
    const m = this.method();
    if (!m || this.locked()) return;
    this.tried.set(true);
    if (this.amountError() || this.referenceError()) return;
    this.record({
      methodId: m.id,
      name: m.name,
      amount: this.amount(),
      received: null,
      change: 0,
      reference: this.reference().trim(),
    });
  }

  private async record(payment: CheckoutPayment): Promise<void> {
    this.payFailed.set(false);
    this.step.set('recording');
    this.pending.set(payment);
    const result = await this.savePayment(payment);
    this.pending.set(null);
    if (result === 'failed') {
      this.step.set('pay');
      this.payFailed.set(true);
      return;
    }
    this.payments.update((list) => [...list, payment]);
    if (this.left() > 0) {
      // Part paid: back to choosing how to pay the rest (cash first).
      this.step.set('pay');
      this.choose(this.methods().find((x) => x.isCash)?.id ?? this.methodId());
      return;
    }
    await this.complete();
  }

  /** After the last payment: complete the sale and issue the receipt. */
  protected async complete(): Promise<void> {
    this.step.set('recording');
    this.completing.set(true);
    const result = await this.finishSale();
    this.completing.set(false);
    if (result === 'failed') {
      this.step.set('recovery');
      return;
    }
    const change = round2(this.payments().reduce((s, p) => s + p.change, 0));
    this.router.navigate(['/pos/sale', result.saleId], { state: { change } });
  }

  /** Called for each payment. Return 'saved' or 'failed' (nothing is recorded then). */
  protected async savePayment(payment: CheckoutPayment): Promise<'saved' | 'failed'> {
    // TODO(you): record this payment on the sale (create the sale on the first payment).
    //  Send the same request id if you retry, so a payment is never recorded twice.
    void payment;
    return 'failed';
  }

  /** Called once everything is paid. Return the sale id, or 'failed'. */
  protected async finishSale(): Promise<{ saleId: string } | 'failed'> {
    // TODO(you): complete the sale and issue its receipt.
    //  On success the basket is done: this.cart.reset() happens on the next page's "Start new sale".
    return 'failed';
  }

  protected findLater(): void {
    // TODO(you): open the sale in Sales (it's marked "needs attention"), or go back to /pos.
  }
}

/** "12a.345" → "12.34" */
function clean(value: string): string {
  const only = value.replace(/[^\d.]/g, '');
  const [whole, ...rest] = only.split('.');
  return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole;
}
