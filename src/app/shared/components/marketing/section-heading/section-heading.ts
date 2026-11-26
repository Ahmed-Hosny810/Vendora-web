import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Title block at the top of a marketing section:
 * a small overline, a big title (the end can be highlighted) and a lead line.
 *
 * Text arrives already translated; this component only lays it out.
 *
 * @example
 * <app-section-heading
 *   headingId="ben-title"
 *   [overline]="t('overline')"
 *   [title]="t('title')"
 *   [highlight]="t('highlight')"
 *   [lead]="t('lead')"
 * />
 */
@Component({
  selector: 'app-section-heading',
  templateUrl: './section-heading.html',
  styleUrl: './section-heading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.inverse]': 'inverse()' },
})
export class SectionHeading {
  readonly overline = input.required<string>();
  readonly title = input.required<string>();
  /** Optional end of the title, drawn with a yellow marker. */
  readonly highlight = input<string>();
  readonly lead = input<string>();
  /** Id of the <h2>, so the <section> can point to it with aria-labelledby. */
  readonly headingId = input.required<string>();
  /** Light text, for dark green sections. */
  readonly inverse = input(false, { transform: booleanAttribute });
}
