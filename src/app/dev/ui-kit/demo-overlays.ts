import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../shared/components/ui';

/**
 * DEV ONLY: sample dialog and drawer contents for /dev/ui.
 * A real feature dialog looks the same: a normal component with our CSS classes,
 * DialogRef to close it, DIALOG_DATA to receive data.
 */
@Component({
  selector: 'app-demo-dialog',
  imports: [TranslocoDirective, VdButton, VdIconButton, VdDialogTitle, LucideX],
  template: `
    <div class="vd-dialog" *transloco="let t">
      <header class="vd-dialog__head">
        <h2 class="vd-dialog__title" vdDialogTitle>{{ t('devUi.dialogTitle') }}</h2>
        <button
          vdIconButton
          size="sm"
          type="button"
          [label]="t('common.close')"
          (click)="ref.close()"
        >
          <svg lucideX></svg>
        </button>
      </header>
      <div class="vd-dialog__body">
        <div class="vd-field">
          <label class="vd-field__label" for="demo-category">{{ t('devUi.categoryName') }}</label>
          <input id="demo-category" class="vd-input" [value]="data.suggestion" />
        </div>
      </div>
      <footer class="vd-dialog__foot">
        <button vdButton type="button" (click)="ref.close()">{{ t('common.cancel') }}</button>
        <button vdButton="primary" type="button" (click)="ref.close('saved')">
          {{ t('common.save') }}
        </button>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoDialog {
  protected readonly ref = inject<DialogRef<string>>(DialogRef);
  protected readonly data = inject<{ suggestion: string }>(DIALOG_DATA);
}

@Component({
  selector: 'app-demo-drawer',
  imports: [TranslocoDirective, VdButton, VdIconButton, VdDialogTitle, LucideX],
  template: `
    <div class="vd-drawer" *transloco="let t">
      <header class="vd-drawer__head">
        <h2 class="vd-drawer__title" vdDialogTitle>{{ t('devUi.drawerTitle') }}</h2>
        <button
          vdIconButton
          size="sm"
          type="button"
          [label]="t('common.close')"
          (click)="ref.close()"
        >
          <svg lucideX></svg>
        </button>
      </header>
      <div class="vd-drawer__body">
        <div class="demo-fields">
          @for (n of fields; track n) {
            <div class="vd-field">
              <label class="vd-field__label" [for]="'demo-drawer-' + n">
                {{ t('devUi.field') }} {{ n }}
              </label>
              <input class="vd-input" [id]="'demo-drawer-' + n" />
            </div>
          }
        </div>
      </div>
      <footer class="vd-drawer__foot">
        <button vdButton type="button" (click)="ref.close()">{{ t('common.cancel') }}</button>
        <button vdButton="primary" type="button" (click)="ref.close()">
          {{ t('common.save') }}
        </button>
      </footer>
    </div>
  `,
  styles: `
    .demo-fields {
      display: grid;
      gap: var(--space-4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoDrawer {
  protected readonly ref = inject(DialogRef);
  protected readonly fields = [1, 2, 3, 4, 5, 6, 7, 8];
}
