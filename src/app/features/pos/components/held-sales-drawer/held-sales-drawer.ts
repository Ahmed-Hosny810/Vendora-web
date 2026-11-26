import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleExclamationPoint,
  LucideClock,
  LucidePlay,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';

import { LoadError } from '../../../../shared/components/app';
import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { formatMoney, HeldSale } from '../../pos.models';

export interface HeldSalesData {
  /** The basket has items: resuming will replace them, so the drawer warns first. */
  basketHasItems: boolean;
  load: () => Promise<HeldSale[] | 'failed'>;
  /** Put the held sale back in the basket. 'resumed' closes the drawer. */
  resume: (sale: HeldSale) => Promise<'resumed' | 'failed'>;
  discard: (sale: HeldSale) => Promise<'discarded' | 'failed'>;
}

/** Sales parked with "Hold" on this terminal: resume one, or throw it away. */
@Component({
  selector: 'app-held-sales-drawer',
  imports: [
    TranslocoDirective,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    LoadError,
    LucideCircleExclamationPoint,
    LucideClock,
    LucidePlay,
    LucideTrash2,
    LucideX,
  ],
  templateUrl: './held-sales-drawer.html',
  styleUrl: './held-sales-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeldSalesDrawer implements OnInit {
  protected readonly data = inject<HeldSalesData>(DIALOG_DATA);
  protected readonly ref = inject(DialogRef);
  protected readonly money = formatMoney;

  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly sales = signal<HeldSale[]>([]);
  /** The sale with a request running. */
  protected readonly busyId = signal<string | null>(null);
  /** The sale whose "Discard" was pressed once: press again to confirm. */
  protected readonly confirmId = signal<string | null>(null);
  protected readonly failed = signal(false);

  ngOnInit(): void {
    this.load();
  }

  protected async load(): Promise<void> {
    this.status.set('loading');
    const list = await this.data.load();
    if (list === 'failed') {
      this.status.set('error');
      return;
    }
    this.sales.set(list);
    this.status.set('ready');
  }

  protected async resume(sale: HeldSale): Promise<void> {
    if (this.busyId()) return;
    this.failed.set(false);
    this.busyId.set(sale.id);
    const result = await this.data.resume(sale);
    this.busyId.set(null);
    if (result === 'resumed') this.ref.close();
    else this.failed.set(true);
  }

  protected async discard(sale: HeldSale): Promise<void> {
    if (this.busyId()) return;
    if (this.confirmId() !== sale.id) {
      this.confirmId.set(sale.id);
      return;
    }
    this.failed.set(false);
    this.busyId.set(sale.id);
    const result = await this.data.discard(sale);
    this.busyId.set(null);
    this.confirmId.set(null);
    if (result === 'discarded') this.sales.update((list) => list.filter((s) => s.id !== sale.id));
    else this.failed.set(true);
  }

  /** Minutes since it was held: "12 min" / "2 h". */
  protected ago(date: Date): { n: number; unit: 'min' | 'h' } {
    const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60_000));
    return minutes < 60 ? { n: minutes, unit: 'min' } : { n: Math.floor(minutes / 60), unit: 'h' };
  }
}
