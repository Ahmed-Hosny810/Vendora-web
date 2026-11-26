import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideArrowRight } from '@lucide/angular';

import { VdButton } from '../../../../shared/components/ui';

/** Last section: a big dark-green "Get started" band with floating price tags. */
@Component({
  selector: 'app-cta-section',
  imports: [RouterLink, TranslocoDirective, VdButton, LucideArrowRight],
  templateUrl: './cta-section.html',
  styleUrl: './cta-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaSection {
  /** Three decorative tags (the Vendora logo shape). */
  protected readonly tags = [1, 2, 3];
}
