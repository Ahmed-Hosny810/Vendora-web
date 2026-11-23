import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideArrowLeft, LucideExternalLink, LucidePrinter } from '@lucide/angular';

import { LanguageService } from '../../../core/i18n';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { LoadError } from '../../../shared/components/app';
import { VdButton, VdWordmark } from '../../../shared/components/ui';
import { formatDate, formatMoney } from '../../../shared/utils/format';
import { InvoiceDetails } from '../billing.models';

/**
 * One Vendora invoice (/billing/invoices/:id), as a printable page.
 * Paid invoices get a PAID stamp; unpaid ones a Pay button that opens Paymob.
 */
@Component({
  selector: 'app-invoice-details-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    VdWordmark,
    LoadError,
    LucideArrowLeft,
    LucideExternalLink,
    LucidePrinter,
  ],
  templateUrl: './invoice-details.page.html',
  styleUrl: './invoice-details.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTranslocoScope('billing')],
})
export class InvoiceDetailsPage {
  protected readonly lang = inject(LanguageService).lang;
  protected readonly money = formatMoney;
  protected readonly date = formatDate;
  /** From the URL: /billing/invoices/<id>. */
  protected readonly invoiceId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly shell = inject(AppShell);

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly invoice = signal<InvoiceDetails | null>(null);
  protected readonly paying = signal(false);

  constructor() {
    this.shell.setPage({ key: 'pages.invoice' }, [
      { key: 'nav.billing', link: '/billing' },
      { key: 'pages.invoice' },
    ]);
    this.load();
  }

  protected load(): void {
    // TODO(you): load the invoice this.invoiceId.
    //  - before: this.status.set('loading')
    //  - success: this.invoice.set(inv); this.status.set('ready')
    //             and show its number in the top bar:
    //             this.shell.setPage({ text: inv.number }, [
    //               { key: 'nav.billing', link: '/billing' }, { text: inv.number }])
    //  - not found / failure: this.status.set('error')
  }

  protected print(): void {
    window.print();
  }

  protected pay(): void {
    if (this.paying()) return;
    // TODO(you): get the Paymob checkout link for this.invoiceId and open it
    //  (window.location.href = url).
    //  - before: this.paying.set(true)
    //  - failure: this.paying.set(false) and toast the error
  }
}
