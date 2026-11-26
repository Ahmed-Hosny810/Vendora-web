import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck } from '@lucide/angular';

import { SectionHeading } from '../../../../shared/components/marketing/section-heading/section-heading';

/** Three "staff badges": what the owner, manager and cashier each do. */
@Component({
  selector: 'app-roles-section',
  imports: [TranslocoDirective, SectionHeading, LucideCheck],
  templateUrl: './roles-section.html',
  styleUrl: './roles-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesSection {
  /** Text: home.roles.<role> (name) and home.team.<role>.sub / .items / .scope */
  protected readonly roles = ['owner', 'manager', 'cashier'] as const;
}
