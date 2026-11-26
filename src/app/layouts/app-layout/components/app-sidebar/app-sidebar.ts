import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideDynamicIcon } from '@lucide/angular';

import { SessionBusiness, UserRole } from '../../../../core/session';
import { VdWordmark } from '../../../../shared/components/ui';
import { navFor } from '../../app-nav';

/**
 * Dark sidebar: wordmark, business card (mini awning), the nav for the
 * user's role, and the setup progress at the bottom (managers only).
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslocoDirective, LucideDynamicIcon, VdWordmark],
  templateUrl: './app-sidebar.html',
  styleUrl: './app-sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebar {
  readonly role = input<UserRole | null>(null);
  readonly business = input<SessionBusiness | null>(null);
  /** Finished setup tasks, or null to hide the setup box. */
  readonly setupDone = input<number | null>(null);
  readonly setupTotal = input(8);
  /** A nav link was clicked (the phone drawer closes). */
  readonly navigate = output();

  protected readonly groups = computed(() => navFor(this.role()));
  protected readonly setupPercent = computed(() =>
    Math.max(4, Math.round(((this.setupDone() ?? 0) / this.setupTotal()) * 100)),
  );
}
