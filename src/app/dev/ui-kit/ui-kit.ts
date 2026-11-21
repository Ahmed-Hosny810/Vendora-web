import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArrowRight,
  LucideBell,
  LucideCircleCheck,
  LucideCircleExclamationPoint,
  LucideEllipsisVertical,
  LucideInfo,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideTrash,
  LucideTriangleExclamationPoint,
  LucideX,
} from '@lucide/angular';

import { LanguageService } from '../../core/i18n';
import { VdButton, VdIconButton, VdMoney, VdWordmark } from '../../shared/components/ui';

/**
 * DEV ONLY (/dev/ui): every shared UI piece in every state, in both languages.
 * It's the living documentation of the UI kit; it grows with each batch.
 */
@Component({
  selector: 'app-ui-kit',
  imports: [
    TranslocoDirective,
    VdButton,
    VdIconButton,
    VdMoney,
    VdWordmark,
    LucideArrowRight,
    LucideBell,
    LucideCircleCheck,
    LucideCircleExclamationPoint,
    LucideEllipsisVertical,
    LucideInfo,
    LucidePencil,
    LucidePlus,
    LucideSearch,
    LucideTrash,
    LucideTriangleExclamationPoint,
    LucideX,
  ],
  templateUrl: './ui-kit.html',
  styleUrl: './ui-kit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiKit {
  protected readonly language = inject(LanguageService);

  protected readonly variants = ['primary', 'secondary', 'ghost', 'danger', 'accent'] as const;
  protected readonly saving = signal(false);
  protected readonly clicks = signal(0);

  protected save(): void {
    this.clicks.update((n) => n + 1);
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1500);
  }
}
