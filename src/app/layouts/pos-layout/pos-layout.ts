import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideArchive,
  LucideHistory,
  LucideLock,
  LucideMonitor,
  LucideStore,
} from '@lucide/angular';

import { AppSession } from '../../core/session';
import { VdIconButton, VdWordmark } from '../../shared/components/ui';
import { PosShell } from './pos-shell';

/**
 * Frame for the cashier's screens (open/close shift, selling, checkout):
 * a dark bar with the branch, terminal and shift, and the page below it.
 * No sidebar, so the POS gets the whole screen. After the shift closes
 * the bar turns light.
 */
@Component({
  selector: 'app-pos-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    TranslocoDirective,
    VdIconButton,
    VdWordmark,
    LucideArchive,
    LucideHistory,
    LucideLock,
    LucideMonitor,
    LucideStore,
  ],
  templateUrl: './pos-layout.html',
  styleUrl: './pos-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PosShell,
    // Loads public/i18n/pos/<lang>.json: keys start with "pos.".
    provideTranslocoScope('pos'),
  ],
})
export class PosLayout {
  protected readonly session = inject(AppSession);
  protected readonly shell = inject(PosShell);

  protected readonly closed = computed(() => this.shell.shift()?.closed ?? false);

  /** "YS" */
  protected readonly initials = computed(() => {
    const parts = (this.session.user()?.name ?? '').trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)![0] : '')).toUpperCase();
  });

  /** "09:02" */
  protected time(date: Date): string {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  protected findSale(): void {
    // TODO(you): open the "Find a sale" search once the POS sales pages exist.
  }
}
