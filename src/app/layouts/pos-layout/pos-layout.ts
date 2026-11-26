import { ChangeDetectionStrategy, Component, computed, inject, Injector } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArchive,
  LucideClock,
  LucideLock,
  LucideMonitor,
  LucideSearch,
  LucideStore,
} from '@lucide/angular';

import { AppSession } from '../../core/session';
import {
  FindSaleData,
  FindSaleDrawer,
} from '../../features/pos/components/find-sale-drawer/find-sale-drawer';
import {
  HeldSalesData,
  HeldSalesDrawer,
} from '../../features/pos/components/held-sales-drawer/held-sales-drawer';
import { PosCart } from '../../features/pos/pos-cart';
import { FoundSale, HeldSale } from '../../features/pos/pos.models';
import { injectDrawer, VdIconButton, VdWordmark } from '../../shared/components/ui';
import { PosShell } from './pos-shell';

/**
 * Frame for the cashier's screens (open/close shift, selling, checkout):
 * a dark bar with the branch, terminal and shift, and the page below it.
 * No sidebar, so the POS gets the whole screen. After the shift closes
 * the bar turns light.
 */
@Component({
  selector: 'app-pos-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    TranslocoDirective,
    VdIconButton,
    VdWordmark,
    LucideArchive,
    LucideClock,
    LucideLock,
    LucideMonitor,
    LucideSearch,
    LucideStore,
  ],
  templateUrl: './pos-layout.html',
  styleUrl: './pos-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PosShell,
    // Loads public/i18n/pos/<lang>.json: keys start with "pos.".
    provideTranslocoScope('pos'),
  ],
})
export class PosLayout {
  protected readonly session = inject(AppSession);
  protected readonly shell = inject(PosShell);
  private readonly cart = inject(PosCart);
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();

  protected readonly closed = computed(() => this.shell.shift()?.closed ?? false);

  /** "YS" */
  protected readonly initials = computed(() => {
    const parts = (this.session.user()?.name ?? '').trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)![0] : '')).toUpperCase();
  });

  /** "09:02" */
  protected time(date: Date): string {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  protected findSale(): void {
    this.openDrawer<void, FindSaleData, FindSaleDrawer>(FindSaleDrawer, {
      data: { search: (query) => this.searchSales(query) },
      injector: this.injector,
    });
  }

  protected openHeld(): void {
    this.openDrawer<void, HeldSalesData, HeldSalesDrawer>(HeldSalesDrawer, {
      data: {
        basketHasItems: !this.cart.isEmpty(),
        load: () => this.loadHeld(),
        resume: (sale) => this.resumeHeld(sale),
        discard: (sale) => this.discardHeld(sale),
      },
      injector: this.injector,
    });
  }

  private async searchSales(query: string): Promise<FoundSale[] | 'failed'> {
    // TODO(you): find sales at this branch by receipt number or customer phone (query),
    //  newest first. Return the list, or 'failed'.
    void query;
    return 'failed';
  }

  private async loadHeld(): Promise<HeldSale[] | 'failed'> {
    // TODO(you): load the sales on hold on this terminal (oldest first).
    //  Return the list (and keep this.shell.heldCount in step), or 'failed'.
    return 'failed';
  }

  private async resumeHeld(sale: HeldSale): Promise<'resumed' | 'failed'> {
    // TODO(you): load the held sale and put it in the basket:
    //  this.cart.lines.set(lines); this.cart.saleDiscount.set(d); this.cart.customer.set(c)
    //  then remove it from the held list on the server, lower this.shell.heldCount,
    //  go to /pos, and return 'resumed'. On failure return 'failed'.
    void sale;
    return 'failed';
  }

  private async discardHeld(sale: HeldSale): Promise<'discarded' | 'failed'> {
    // TODO(you): delete the held sale, lower this.shell.heldCount, and return 'discarded'
    //  (or 'failed').
    void sale;
    return 'failed';
  }
}
