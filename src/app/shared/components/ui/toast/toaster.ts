import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  LucideCircleCheck,
  LucideCircleExclamationPoint,
  LucideInfo,
  LucideTriangleExclamationPoint,
  LucideX,
} from '@lucide/angular';

import { ToastService } from './toast.service';

/**
 * Shows the toasts from ToastService. Placed ONCE, in app.ts.
 * Screen readers are informed by ToastService (LiveAnnouncer), not by this markup.
 */
@Component({
  selector: 'vd-toaster',
  imports: [
    TranslocoPipe,
    LucideCircleCheck,
    LucideCircleExclamationPoint,
    LucideInfo,
    LucideTriangleExclamationPoint,
    LucideX,
  ],
  templateUrl: './toaster.html',
  styleUrl: './toaster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VdToaster {
  protected readonly toast = inject(ToastService);
}
