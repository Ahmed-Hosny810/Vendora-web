import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Vendora button. Applied to a real <button> or <a>, so keyboard, forms,
 * `disabled` and `routerLink` keep working as normal.
 *
 * @example
 * <button vdButton="primary" type="submit">Save</button>
 * <button vdButton type="button">Cancel</button>            ← secondary is the default
 * <a vdButton="ghost" routerLink="/products">All products</a>
 * <button vdButton="primary" [loading]="saving()">Save</button>
 * <button vdButton="primary"><svg lucidePlus></svg> Add product</button>
 */
@Component({
  selector: 'button[vdButton], a[vdButton]',
  template: '<ng-content />',
  styleUrl: './button.scss',
  // Styles must reach projected icons and work on a native element,
  // so they are not encapsulated. Every selector starts with .vd-btn,
  // so nothing leaks onto other elements.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-disabled]': 'loading() || null',
  },
})
export class VdButton {
  /** `vdButton="primary"`. An empty `vdButton` means secondary. */
  readonly variant = input<ButtonVariant, ButtonVariant | ''>('secondary', {
    alias: 'vdButton',
    transform: (value) => value || 'secondary',
  });
  readonly size = input<ButtonSize>('md');
  /** Full width. */
  readonly block = input(false, { transform: booleanAttribute });
  /** Marketing style: ink edge that lifts into an offset shadow on hover. */
  readonly stamp = input(false, { transform: booleanAttribute });
  /** Shows a spinner and ignores clicks, but keeps focus (unlike `disabled`). */
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly hostClass = computed(() =>
    [
      'vd-btn',
      `vd-btn--${this.variant()}`,
      this.size() !== 'md' && `vd-btn--${this.size()}`,
      this.block() && 'vd-btn--block',
      this.stamp() && 'vd-btn--stamp',
    ]
      .filter(Boolean)
      .join(' '),
  );

  constructor() {
    // While loading, stop the click before the page's own (click) handler runs.
    // A capture listener on the element itself runs first, for mouse AND keyboard.
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const block = (event: Event) => {
      if (this.loading()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    element.addEventListener('click', block, { capture: true });
    inject(DestroyRef).onDestroy(() =>
      element.removeEventListener('click', block, { capture: true }),
    );
  }
}
