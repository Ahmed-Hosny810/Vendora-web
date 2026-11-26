import { CdkDialogContainer, DialogRef } from '@angular/cdk/dialog';
import { Directive, inject, OnDestroy } from '@angular/core';

let nextId = 0;

/**
 * Marks the heading of a dialog or drawer, so screen readers announce it
 * when the dialog opens ("Add category, dialog").
 * CDK has no title directive of its own (Angular Material adds one the same way).
 *
 * @example
 * <h2 vdDialogTitle>Add category</h2>
 */
@Directive({
  selector: '[vdDialogTitle]',
  host: { '[id]': 'id' },
})
export class VdDialogTitle implements OnDestroy {
  protected readonly id = `vd-dialog-title-${nextId++}`;

  // The dialog box (container) that CDK created around our content.
  private readonly container = inject(DialogRef, { optional: true })?.containerInstance as
    CdkDialogContainer | undefined;

  constructor() {
    // Becomes the dialog's aria-labelledby. Wait one microtask: if the title is
    // created in the middle of a render (e.g. inside *transloco), registering it
    // right away would be missed until the next render. Angular Material does the same.
    void Promise.resolve().then(() => this.container?._addAriaLabelledBy(this.id));
  }

  ngOnDestroy(): void {
    this.container?._removeAriaLabelledBy(this.id);
  }
}
