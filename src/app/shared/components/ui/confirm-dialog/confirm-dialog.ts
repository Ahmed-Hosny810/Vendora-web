import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { VdButton } from '../button/button';
import { VdDialogTitle } from '../dialog/dialog-title';

export interface ConfirmDialogData {
  title: string;
  message?: string;
  /** Default: "Confirm" (translated). */
  confirmText?: string;
  /** Default: "Cancel" (translated). */
  cancelText?: string;
  /** Red confirm button, for actions that delete or can't be undone. */
  danger?: boolean;
}

/**
 * A ready-made yes/no dialog. Closes with `true` (confirmed);
 * Cancel, Esc and clicking outside all give a falsy result.
 * Focus starts on the title, so pressing Enter by accident does nothing.
 *
 * @example
 * const ref = this.dialog.open<boolean, ConfirmDialogData>(VdConfirmDialog, {
 *   data: { title: t('product.deleteTitle'), message: t('product.deleteText'), confirmText: t('common.delete'), danger: true },
 * });
 * ref.closed.subscribe((confirmed) => { if (confirmed) this.delete(); });
 */
@Component({
  selector: 'vd-confirm-dialog',
  imports: [VdButton, VdDialogTitle, TranslocoPipe],
  template: `
    <div class="vd-dialog vd-dialog--sm">
      <header class="vd-dialog__head">
        <h2 class="vd-dialog__title" vdDialogTitle>{{ data.title }}</h2>
      </header>
      @if (data.message) {
        <div class="vd-dialog__body">
          <p>{{ data.message }}</p>
        </div>
      }
      <footer class="vd-dialog__foot">
        <button vdButton type="button" (click)="ref.close(false)">
          {{ data.cancelText ?? ('common.cancel' | transloco) }}
        </button>
        <button
          [vdButton]="data.danger ? 'danger' : 'primary'"
          type="button"
          (click)="ref.close(true)"
        >
          {{ data.confirmText ?? ('common.confirm' | transloco) }}
        </button>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VdConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}
