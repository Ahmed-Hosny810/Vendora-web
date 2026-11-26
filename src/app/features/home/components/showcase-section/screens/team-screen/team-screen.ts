import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideMail, LucideMonitor, LucideUserPlus } from '@lucide/angular';

/**
 * Picture of the branches & team screen.
 * The parent gives it role="img" and an aria-label describing it.
 */
@Component({
  selector: 'app-team-screen',
  imports: [TranslocoDirective, LucideCheck, LucideMail, LucideMonitor, LucideUserPlus],
  templateUrl: './team-screen.html',
  styleUrl: './team-screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamScreen {
  protected readonly branches = [
    { key: 'zamalek', counters: 2, selected: true },
    { key: 'heliopolis', counters: 3, selected: false },
    { key: 'newCairo', counters: 1, selected: false },
  ] as const;

  /** Names are illustrative and the same in both languages. */
  protected readonly people = [
    {
      initials: 'YH',
      name: 'Yasmine H.',
      role: 'owner',
      access: ['all'],
      invited: false,
      color: 'var(--butter-300)',
    },
    {
      initials: 'KS',
      name: 'Karim S.',
      role: 'manager',
      access: ['zamalek', 'heliopolis'],
      invited: false,
      color: 'var(--pine-50)',
    },
    {
      initials: 'NM',
      name: 'Nour M.',
      role: 'cashier',
      access: ['zamalek'],
      invited: false,
      color: 'var(--pine-100)',
    },
    {
      initials: 'YA',
      name: 'Youssef A.',
      role: 'cashier',
      access: ['zamalek'],
      invited: true,
      color: 'var(--butter-100)',
    },
  ] as const;

  /** [1, 2, 3] for 3 counters, so the template can draw one chip each. */
  protected counters(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
}
