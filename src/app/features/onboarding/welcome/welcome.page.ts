import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideClock,
  LucideIcon,
  LucideLayers,
  LucideMonitor,
  LucidePackage,
  LucideReceiptText,
  LucideStore,
  LucideUserPlus,
} from '@lucide/angular';

import { OnboardingStage } from '../../../layouts/onboarding-layout/onboarding-stage';
import { ChecklistItem } from '../components/checklist-item/checklist-item';
import { OnbHead } from '../components/onb-head/onb-head';
import { OnboardingDraft } from '../onboarding-draft';
import { CHECKLIST_KEYS, ChecklistKey } from '../onboarding.models';

interface ChecklistRow {
  key: ChecklistKey;
  icon: LucideIcon;
  /** Key under onboarding.welcome.tags. */
  tag?: 'tracking' | 'ifNeeded';
}

const ROWS: Record<ChecklistKey, ChecklistRow> = {
  branch: { key: 'branch', icon: LucideStore },
  terminal: { key: 'terminal', icon: LucideMonitor },
  products: { key: 'products', icon: LucidePackage },
  stock: { key: 'stock', icon: LucideLayers, tag: 'tracking' },
  employees: { key: 'employees', icon: LucideUserPlus, tag: 'ifNeeded' },
  shift: { key: 'shift', icon: LucideClock },
  sale: { key: 'sale', icon: LucideReceiptText },
};

/**
 * After activation: the shop is open, and a checklist leads to the first sale.
 * No stepper here. "Add opening stock" only shows when inventory is tracked.
 */
@Component({
  selector: 'app-welcome-page',
  imports: [TranslocoDirective, OnbHead, ChecklistItem],
  templateUrl: './welcome.page.html',
  styleUrl: './welcome.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePage {
  protected readonly draft = inject(OnboardingDraft);

  // ---------- Set by your logic ----------
  /** Tasks already finished. TODO(you): fill from the API (e.g. a branch exists). */
  protected readonly done = signal<ReadonlySet<ChecklistKey>>(new Set());
  /** TODO(you): read from the created business, not the draft, after a refresh. */
  protected readonly businessName = computed(() => this.draft.details().nameEn.trim());
  protected readonly tracksInventory = computed(() => this.draft.details().inventory === 'track');

  protected readonly rows = computed(() =>
    CHECKLIST_KEYS.filter((key) => key !== 'stock' || this.tracksInventory()).map(
      (key) => ROWS[key],
    ),
  );
  protected readonly doneCount = computed(
    () => this.rows().filter((row) => this.done().has(row.key)).length,
  );
  /** The first task that isn't done gets the highlight. */
  protected readonly nextKey = computed(
    () => this.rows().find((row) => !this.done().has(row.key))?.key ?? null,
  );

  constructor() {
    inject(OnboardingStage).show({
      step: null,
      caption: 'welcome',
      mood: 'open',
      door: 'open',
      wide: true,
    });
  }

  protected start(key: ChecklistKey): void {
    // TODO(you): open the screen for this task, e.g. 'branch' → this.router.navigate(['/branches/new'])
    void key;
  }

  protected skip(): void {
    // TODO(you): go to the dashboard.
  }
}
