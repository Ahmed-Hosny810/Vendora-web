import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The Vendora wordmark: a butter price tag + "vendora".
 * It is never translated or mirrored (logos stay the same in Arabic).
 * Wrap it in a link yourself; hovering or focusing that link sways the tag.
 *
 * @example
 * <a routerLink="/" aria-label="Vendora home"><vd-wordmark intro /></a>
 * <vd-wordmark size="sm" />   on dark: put it inside .vd-inverse
 */
@Component({
  selector: 'vd-wordmark',
  templateUrl: './wordmark.html',
  styleUrl: './wordmark.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.intro]': 'intro()',
    '[attr.data-size]': 'size()',
  },
})
export class VdWordmark {
  /** Swing the tag in once when it appears (use in the main header only). */
  readonly intro = input(false, { transform: booleanAttribute });
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
