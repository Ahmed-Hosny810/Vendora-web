import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideArrowLeft, LucideHouse } from '@lucide/angular';

import { VdButton, VdWordmark } from '../../shared/components/ui';

/**
 * 404 (any address that doesn't exist). A shelf tag that rang up "404 · item
 * not found", and two ways out: the website or the app.
 */
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslocoDirective, VdButton, VdWordmark, LucideArrowLeft, LucideHouse],
  templateUrl: './not-found.page.html',
  styleUrl: './not-found.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/errors/<lang>.json (keys start with "errors.").
  providers: [provideTranslocoScope('errors')],
})
export class NotFoundPage {
  /** The barcode under the tag: bar widths in px, fixed so it looks the same every time. */
  protected readonly bars = [
    3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 1, 2, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2,
  ];
}
