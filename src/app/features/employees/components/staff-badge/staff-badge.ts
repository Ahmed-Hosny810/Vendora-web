import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { initials } from '../../employees.models';

/**
 * A staff ID card hanging from a lanyard, swaying a little.
 * Beside the invite form; it fills in as you type.
 */
@Component({
  selector: 'app-staff-badge',
  template: `
    <span class="lanyard"></span>
    <div class="card">
      <span class="top"></span>
      <span class="av">{{ letters() }}</span>
      <b dir="auto">{{ name() || placeholder() }}</b>
      <span class="user" dir="ltr">&#64;{{ username() || '…' }}</span>
      <span class="role">{{ role() }}</span>
      <span class="biz" dir="auto">{{ business() }}</span>
    </div>
  `,
  styleUrl: './staff-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class StaffBadge {
  readonly name = input('');
  /** Shown while the name is empty ("Employee name"). */
  readonly placeholder = input('');
  readonly username = input('');
  /** Already translated ("Cashier"). */
  readonly role = input('');
  readonly business = input('');

  protected readonly letters = computed(() => initials(this.name()) || '?');
}
