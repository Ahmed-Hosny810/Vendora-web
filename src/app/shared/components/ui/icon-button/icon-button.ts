import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

/**
 * A square button that shows only an icon. `label` is required: it's what
 * screen readers announce, since there's no visible text.
 *
 * @example
 * <button vdIconButton type="button" [label]="t('common.close')" (click)="close()">
 *   <svg lucideX></svg>
 * </button>
 */
@Component({
  selector: 'button[vdIconButton], a[vdIconButton]',
  template: '<ng-content />',
  styleUrl: './icon-button.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'vd-iconbtn',
    '[class.vd-iconbtn--sm]': "size() === 'sm'",
    '[class.vd-iconbtn--outline]': 'outline()',
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'label()',
  },
})
export class VdIconButton {
  readonly label = input.required<string>();
  readonly size = input<'sm' | 'md'>('md');
  readonly outline = input(false, { transform: booleanAttribute });
}
