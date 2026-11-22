import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideArrowRight, LucideCheck, LucideRefreshCw } from '@lucide/angular';

import { VdButton } from '../../../../shared/components/ui';
import { PosDemo } from './pos-demo/pos-demo';

/**
 * First screen of the home page: headline, two buttons, three checks,
 * and the animated POS demo on the side (below on smaller screens).
 */
@Component({
  selector: 'app-hero-section',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PosDemo,
    LucideArrowRight,
    LucideCheck,
    LucideRefreshCw,
  ],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  /**
   * Bumped by "Replay demo". The template draws the demo inside
   * @for over [demoRun()], so a new number = a brand-new demo that
   * plays its animation again from the start.
   */
  protected readonly demoRun = signal(0);

  protected replay(): void {
    this.demoRun.update((run) => run + 1);
  }
}
