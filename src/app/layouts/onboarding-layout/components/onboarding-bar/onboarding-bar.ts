import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideGlobe, LucideLogOut } from '@lucide/angular';

import { AppLang } from '../../../../core/i18n';
import { VdWordmark } from '../../../../shared/components/ui';

interface BarStep {
  key: 'details' | 'plan' | 'review' | 'payment';
  /** Where a finished step links back to (payment never does). */
  link: string | null;
}

/**
 * Onboarding top bar: wordmark, the 4-step stepper (price tags on a string),
 * language link and Sign out. Below 640px the stepper becomes a thin
 * segmented progress bar under the header.
 */
@Component({
  selector: 'app-onboarding-bar',
  imports: [RouterLink, TranslocoDirective, VdWordmark, LucideCheck, LucideGlobe, LucideLogOut],
  templateUrl: './onboarding-bar.html',
  styleUrl: './onboarding-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingBar {
  /** 0–3, or null to hide the stepper. */
  readonly step = input<number | null>(0);
  readonly lang = input.required<AppLang>();
  readonly languageChange = output<AppLang>();
  readonly signOut = output();

  protected readonly steps: BarStep[] = [
    { key: 'details', link: '/onboarding' },
    { key: 'plan', link: '/onboarding/plan' },
    { key: 'review', link: '/onboarding/review' },
    { key: 'payment', link: null },
  ];

  /** The language the link switches TO. */
  protected readonly other = computed(() =>
    this.lang() === 'ar'
      ? { code: 'en' as const, label: 'English' }
      : { code: 'ar' as const, label: 'العربية' },
  );

  protected stateOf(index: number, current: number): 'done' | 'cur' | 'todo' {
    return index < current ? 'done' : index === current ? 'cur' : 'todo';
  }
}
