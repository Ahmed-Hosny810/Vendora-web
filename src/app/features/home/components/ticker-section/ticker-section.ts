import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucidePause, LucidePlay, LucideTag } from '@lucide/angular';

/**
 * Dark strip of feature names that scrolls sideways forever.
 * It has a pause button (moving content must be stoppable), and it also
 * pauses on hover and while something inside has keyboard focus.
 */
@Component({
  selector: 'app-ticker-section',
  imports: [TranslocoDirective, LucidePause, LucidePlay, LucideTag],
  templateUrl: './ticker-section.html',
  styleUrl: './ticker-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TickerSection {
  /** UI state only: is the strip stopped? */
  protected readonly paused = signal(false);

  protected togglePause(): void {
    this.paused.update((paused) => !paused);
  }
}
