import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import { LucideCircleExclamationPoint, LucideInfo, LucideX } from '@lucide/angular';

import { VdButton, VdDialogTitle, VdIconButton } from '../../../../shared/components/ui';
import { PlanCard } from '../../../onboarding/components/plan-card/plan-card';
import { BillingPlan, ChangePlanResult, overLimits, PlanUsage } from '../../billing.models';

export interface ChangePlanData {
  plans: BillingPlan[];
  currentId: string;
  usage: PlanUsage;
  change: (plan: BillingPlan) => Promise<ChangePlanResult>;
}

/**
 * Pick another plan, in a side drawer. Uses the same plan cards as onboarding.
 * A plan whose limits are below what the business already uses can't be
 * picked until the extra branches / products / cashiers are removed.
 */
@Component({
  selector: 'app-change-plan-drawer',
  imports: [
    TranslocoDirective,
    VdButton,
    VdIconButton,
    VdDialogTitle,
    PlanCard,
    LucideCircleExclamationPoint,
    LucideInfo,
    LucideX,
  ],
  templateUrl: './change-plan-drawer.html',
  styleUrl: './change-plan-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The plan cards read their words from the onboarding files.
  providers: [provideTranslocoScope('onboarding')],
})
export class ChangePlanDrawer {
  protected readonly data = inject<ChangePlanData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<BillingPlan>>(DialogRef);

  protected readonly selectedId = signal(this.data.currentId);
  protected readonly selected = computed(
    () => this.data.plans.find((plan) => plan.id === this.selectedId()) ?? null,
  );
  protected readonly current = computed(
    () => this.data.plans.find((plan) => plan.id === this.data.currentId) ?? null,
  );
  /** Limits the picked plan is too small for. */
  protected readonly blocked = computed(() => {
    const plan = this.selected();
    return plan ? overLimits(plan, this.data.usage) : [];
  });
  protected readonly canSwitch = computed(
    () => this.selectedId() !== this.data.currentId && !this.blocked().length,
  );

  protected readonly status = signal<'idle' | 'saving' | 'failed'>('idle');
  protected readonly saving = computed(() => this.status() === 'saving');

  protected async confirm(): Promise<void> {
    const plan = this.selected();
    if (!plan || !this.canSwitch() || this.saving()) return;
    this.status.set('saving');
    const result = await this.data.change(plan);
    if (result === 'changed') {
      this.ref.close(plan);
      return;
    }
    this.status.set('failed');
  }
}
