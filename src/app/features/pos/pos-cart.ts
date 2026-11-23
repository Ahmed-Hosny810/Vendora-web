import { computed, Injectable, signal } from '@angular/core';

import { CartLine, Customer, Discount, saleTotals } from './pos.models';

/**
 * The sale being rung up. It lives outside the pages so it survives going
 * from the selling screen to checkout and back.
 */
@Injectable({ providedIn: 'root' })
export class PosCart {
  readonly lines = signal<CartLine[]>([]);
  readonly saleDiscount = signal<Discount | null>(null);
  readonly customer = signal<Customer | null>(null);

  readonly totals = computed(() => saleTotals(this.lines(), this.saleDiscount()));
  readonly isEmpty = computed(() => this.lines().length === 0);

  /** Start a new, empty sale. */
  reset(): void {
    this.lines.set([]);
    this.saleDiscount.set(null);
    this.customer.set(null);
  }
}
