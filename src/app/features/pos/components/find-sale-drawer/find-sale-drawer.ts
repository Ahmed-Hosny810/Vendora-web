import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleExclamationPoint,
  LucideReceiptText,
  LucideSearch,
  LucideUndo2,
  LucideX,
} from '@lucide/angular';

import { LanguageService } from '../../../../core/i18n';
import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { formatDateTime } from '../../../../shared/utils/format';
import { formatMoney, FoundSale } from '../../pos.models';

export interface FindSaleData {
  /** Look up by receipt number or customer phone. 'failed' shows an error. */
  search: (query: string) => Promise<FoundSale[] | 'failed'>;
}

/**
 * "Find a sale" from the POS bar: type a receipt number or a customer's
 * phone, then open its receipt or start a return.
 */
@Component({
  selector: 'app-find-sale-drawer',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    LucideCircleExclamationPoint,
    LucideReceiptText,
    LucideSearch,
    LucideUndo2,
    LucideX,
  ],
  templateUrl: './find-sale-drawer.html',
  styleUrl: './find-sale-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindSaleDrawer {
  protected readonly data = inject<FindSaleData>(DIALOG_DATA);
  protected readonly ref = inject(DialogRef);
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly dateTime = formatDateTime;

  protected readonly query = signal('');
  protected readonly status = signal<'idle' | 'searching' | 'done' | 'failed'>('idle');
  protected readonly results = signal<FoundSale[]>([]);

  protected async search(event: Event): Promise<void> {
    event.preventDefault();
    const q = this.query().trim();
    if (!q || this.status() === 'searching') return;
    this.status.set('searching');
    const found = await this.data.search(q);
    if (found === 'failed') {
      this.status.set('failed');
      return;
    }
    this.results.set(found);
    this.status.set('done');
  }
}
