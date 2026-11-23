import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  form,
  FormField,
  maxLength,
  pattern,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint } from '@lucide/angular';

import { AppSession } from '../../../core/session';
import { AppShell } from '../../../layouts/app-layout/app-shell';
import { FormSection, PageHead } from '../../../shared/components/app';
import { VdButton } from '../../../shared/components/ui';
import { BRANCH_LIMITS, BranchForm, CODE_PATTERN } from '../branches.models';
import { BranchShop } from '../components/branch-shop/branch-shop';
import { ReceiptPreview } from '../components/receipt-preview/receipt-preview';

const EMPTY_BRANCH: BranchForm = {
  nameEn: '',
  nameAr: '',
  code: '',
  city: '',
  address: '',
  phone: '',
  receiptHeader: '',
  isMain: false,
  allowNegativeStock: false,
};

/**
 * Add a branch (/branches/new) or edit one (/branches/:id/edit).
 * Basics first, the receipt header second, advanced switches in a dashed
 * panel. Beside it, a live storefront and receipt preview.
 *  - idle:   the form
 *  - saving: Save busy, fields locked
 *  - failed: danger banner at the top, everything typed is kept
 */
@Component({
  selector: 'app-branch-form-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    FormField,
    VdButton,
    PageHead,
    FormSection,
    BranchShop,
    ReceiptPreview,
    LucideCheck,
    LucideCircleExclamationPoint,
  ],
  templateUrl: './branch-form.page.html',
  styleUrl: './branch-form.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/branches/<lang>.json (keys start with "branches.").
  providers: [provideTranslocoScope('branches')],
})
export class BranchFormPage {
  protected readonly session = inject(AppSession);
  protected readonly limits = BRANCH_LIMITS;

  /** Set when editing (/branches/:id/edit). */
  protected readonly branchId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  protected readonly model = signal<BranchForm>({ ...EMPTY_BRANCH });

  protected readonly branchForm = form(this.model, (f) => {
    validate(f.nameEn, ({ value }) => (value().trim() ? null : { kind: 'required' }));
    maxLength(f.nameEn, BRANCH_LIMITS.name);
    maxLength(f.nameAr, BRANCH_LIMITS.name);
    required(f.code);
    pattern(f.code, CODE_PATTERN);
    maxLength(f.code, BRANCH_LIMITS.code);
    maxLength(f.city, BRANCH_LIMITS.city);
    maxLength(f.address, BRANCH_LIMITS.address);
    maxLength(f.phone, BRANCH_LIMITS.phone);
    maxLength(f.receiptHeader, BRANCH_LIMITS.receiptHeader);
  });

  // ---------- Set by your logic ----------
  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  /** The server said this branch code is already used. */
  protected readonly codeTaken = signal(false);

  protected readonly saving = computed(() => this.status() === 'saving');
  /** Save was pressed at least once: from then on the banner counts the errors. */
  protected readonly tried = signal(false);

  protected readonly nameEnError = computed(() => {
    const field = this.branchForm.nameEn();
    return field.touched() && field.invalid();
  });

  /** Error key under branches.form.errors, or null. */
  protected readonly codeError = computed(() => {
    if (this.codeTaken()) return 'codeTaken';
    const field = this.branchForm.code();
    if (!field.touched() || !field.invalid()) return null;
    return field.errors()[0].kind === 'pattern' ? 'codeFormat' : 'codeRequired';
  });

  protected readonly errorCount = computed(
    () => Number(this.nameEnError()) + Number(this.codeError() !== null),
  );

  /** "14 Abbas El Akkad St. · Cairo" for the receipt preview. */
  protected readonly receiptAddress = computed(() =>
    [this.model().address.trim(), this.model().city.trim()].filter(Boolean).join(' · '),
  );

  constructor() {
    const shell = inject(AppShell);
    const page = this.branchId ? 'pages.editBranch' : 'pages.addBranch';
    shell.setPage({ key: page }, [{ key: 'nav.branches', link: '/branches' }, { key: page }]);

    // TODO(you): when editing (this.branchId is set), load the branch and fill the form:
    //  this.model.set({ nameEn, nameAr, code, city, address, phone, receiptHeader, isMain, allowNegativeStock })
    //  When adding the very first branch, you may want isMain: true.
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.saving()) return;
    this.tried.set(true);
    this.codeTaken.set(false);

    if (this.branchForm().invalid()) {
      const first = this.nameEnError() || !this.model().nameEn.trim() ? 'b-name-en' : 'b-code';
      queueMicrotask(() => document.getElementById(first)?.focus());
    }

    await submit(this.branchForm, async () => {
      // TODO(you): create (or update, if this.branchId) the branch with this.model().
      //  - before the request: this.status.set('saving')
      //  - success: toast "Branch saved" ({{name}} is ready…) with an "Add a terminal" action,
      //             then go to /branches/<id>
      //  - code already used: this.status.set('idle'); this.codeTaken.set(true)
      //  - other failure: this.status.set('failed')
    });
  }
}
