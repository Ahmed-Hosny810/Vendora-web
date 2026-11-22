import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Tells you when an element scrolls into view (once).
 * Adds the class "is-in-view" to the element and emits `inView`.
 * Used to start an animation only when people can actually see it.
 *
 * @example
 * <figure appInView (inView)="started.set(true)">…</figure>
 * <figure appInView [inViewThreshold]="0.5">…</figure>  <!-- half visible -->
 */
@Directive({
  selector: '[appInView]',
  host: { '[class.is-in-view]': 'visible()' },
})
export class InView {
  /** How much of the element must be visible: 0 = any pixel, 1 = all of it. */
  readonly inViewThreshold = input(0.25);
  readonly inView = output<void>();

  protected readonly visible = signal(false);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    // Runs in the browser only, after the element is on the page.
    afterNextRender(() => {
      // Very old browsers: treat it as visible straight away.
      if (!('IntersectionObserver' in window)) {
        this.show();
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.show();
            observer.disconnect();
          }
        },
        { threshold: this.inViewThreshold() },
      );
      observer.observe(element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private show(): void {
    this.visible.set(true);
    this.inView.emit();
  }
}
