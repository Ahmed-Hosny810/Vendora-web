import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck } from '@lucide/angular';

/**
 * Numbered steps joined by short lines: ① Select item — ② Enter quantities — ③ Review.
 * Steps before `current` get a check; `current` past the last step checks them all.
 *
 * @example
 * <app-step-line [steps]="[t('a'), t('b'), t('c')]" [current]="2" [label]="t('steps')" />
 */
@Component({
  selector: 'app-step-line',
  imports: [LucideCheck],
  template: `
    <ol [attr.aria-label]="label()">
      @for (s of steps(); track $index; let i = $index) {
        <li
          [class.done]="i + 1 < current()"
          [class.cur]="i + 1 === current()"
          [attr.aria-current]="i + 1 === current() ? 'step' : null"
        >
          <span class="n" aria-hidden="true">
            @if (i + 1 < current()) {
              <svg lucideCheck></svg>
            } @else {
              {{ i + 1 }}
            }
          </span>
          {{ s }}
        </li>
      }
    </ol>
  `,
  styleUrl: './step-line.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepLine {
  readonly steps = input.required<string[]>();
  /** 1-based. */
  readonly current = input.required<number>();
  readonly label = input.required<string>();
}
