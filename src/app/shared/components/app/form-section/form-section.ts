import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A numbered white panel inside a form: "① Branch details".
 * `advanced` draws it dashed and striped, for settings most people skip.
 *
 * @example
 * <app-form-section [n]="1" [title]="t('details')">…fields…</app-form-section>
 * <app-form-section [n]="3" [title]="t('advanced')" [note]="t('later')" advanced>…</app-form-section>
 */
@Component({
  selector: 'app-form-section',
  template: `
    <div class="h">
      <span class="n" aria-hidden="true">{{ n() }}</span>
      <h2 [id]="headingId">{{ title() }}</h2>
      @if (note()) {
        <p>{{ note() }}</p>
      }
    </div>
    <ng-content />
  `,
  styleUrl: './form-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    '[attr.aria-labelledby]': 'headingId',
    '[class.advanced]': 'advanced()',
  },
})
export class FormSection {
  readonly n = input.required<number>();
  readonly title = input.required<string>();
  readonly note = input('');
  readonly advanced = input(false, { transform: booleanAttribute });

  private static nextId = 0;
  protected readonly headingId = `form-section-${FormSection.nextId++}`;
}
