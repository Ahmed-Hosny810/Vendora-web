import { DEFAULT_DIALOG_CONFIG, Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Injector, Provider } from '@angular/core';

/**
 * Default options for every `Dialog.open()` in the app: our backdrop and panel
 * classes (styled in styles/components/_overlays.scss). Add once in app.config.ts.
 */
export function provideDialogDefaults(): Provider {
  return {
    provide: DEFAULT_DIALOG_CONFIG,
    // Start from CDK's own defaults (role="dialog", backdrop, close on navigation…):
    // providing this token REPLACES them instead of merging, so we copy them first.
    useValue: {
      ...new DialogConfig(),
      backdropClass: 'vd-backdrop',
      panelClass: 'vd-dialog-pane',
      maxWidth: 'calc(100vw - 32px)',
      ariaModal: true,
      // Focus the title when a dialog opens: screen readers read it first,
      // and pressing Enter by accident doesn't press a button.
      autoFocus: 'first-heading',
      restoreFocus: true,
    } satisfies DialogConfig,
  };
}

/**
 * Opens a CDK dialog as a side drawer: full height, at the end side of the
 * screen (right in English, left in Arabic). Call it in a field, like inject().
 * The drawer content is a normal component using the .vd-drawer classes.
 *
 * @example
 * private readonly openDrawer = injectDrawer();
 *
 * edit(product: Product) {
 *   const ref = this.openDrawer(EditProductDrawer, { data: product });
 *   ref.closed.subscribe((saved) => …);
 * }
 */
export function injectDrawer() {
  const dialog = inject(Dialog);
  const injector = inject(Injector);

  return <R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    config: DialogConfig<D, DialogRef<R, C>> = {},
  ): DialogRef<R, C> =>
    dialog.open<R, D, C>(component, {
      ...config,
      panelClass: 'vd-drawer-pane',
      maxWidth: '100vw',
      height: '100%',
      positionStrategy: createGlobalPositionStrategy(injector).top('0').end('0'),
    });
}
