import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucidePackage, LucideRotateCcw, LucideStore } from '@lucide/angular';

import { SectionHeading } from '../../../../shared/components/marketing/section-heading/section-heading';

/**
 * Features "bento": five cards of different sizes, one per product area,
 * each with a list of capability chips and a small picture.
 */
@Component({
  selector: 'app-features-section',
  imports: [TranslocoDirective, SectionHeading, LucidePackage, LucideRotateCcw, LucideStore],
  templateUrl: './features-section.html',
  styleUrl: './features-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesSection {
  protected readonly branches = [
    { key: 'zamalek', terminals: 2 },
    { key: 'heliopolis', terminals: 3 },
    { key: 'newCairo', terminals: 1 },
  ] as const;

  protected readonly avatars = [
    { initials: 'YH', color: 'var(--butter-300)' },
    { initials: 'KS', color: 'var(--pine-300)' },
    { initials: 'NM', color: 'var(--pine-100)' },
    { initials: 'YA', color: 'var(--butter-100)' },
  ];

  protected readonly cashiers = [
    { name: 'Nour M.', sales: 118, amount: '18,940' },
    { name: 'Omar F.', sales: 104, amount: '16,210' },
    { name: 'Salma R.', sales: 90, amount: '13,080' },
  ];
}
