import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCheck } from '@lucide/angular';

/**
 * One tab's content in "See it work": text and ticks on one side,
 * the screen (passed inside the tag) on the other.
 *
 * @example
 * <app-showcase-panel [title]="…" [text]="…" [bullets]="…" [illustrative]="…">
 *   <app-pos-screen />
 * </app-showcase-panel>
 */
@Component({
  selector: 'app-showcase-panel',
  imports: [LucideCheck],
  templateUrl: './showcase-panel.html',
  styleUrl: './showcase-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePanel {
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly bullets = input.required<readonly string[]>();
  /** Optional small note under the ticks. */
  readonly note = input<string>();
  /** The "Illustrative data" label. */
  readonly illustrative = input.required<string>();
}
