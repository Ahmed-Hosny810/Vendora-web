import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideArrowRight, LucideCheck, LucideDynamicIcon } from '@lucide/angular';

import { SETUP_TASKS, SetupTask } from '../../../../core/session';
import { VdButton } from '../../../../shared/components/ui';
import { SETUP_TASK_VIEWS } from '../../overview.models';

/**
 * The owner's setup checklist, drawn as receipt tape: butter header with a
 * progress meter, dashed tear line, then one row per task. Finished tasks
 * are struck through with a DONE stamp; the first unfinished one is
 * highlighted with a primary Start button.
 */
@Component({
  selector: 'app-setup-checklist',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    LucideArrowRight,
    LucideCheck,
    LucideDynamicIcon,
  ],
  templateUrl: './setup-checklist.html',
  styleUrl: './setup-checklist.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupChecklist {
  readonly done = input.required<ReadonlySet<SetupTask>>();
  /** The task finished most recently: its stamp lands with a bounce. */
  readonly justDone = input<SetupTask | null>(null);

  protected readonly tasks = SETUP_TASKS.map((key) => SETUP_TASK_VIEWS[key]);
  protected readonly total = SETUP_TASKS.length;
  protected readonly doneCount = computed(() => this.done().size);
  protected readonly nextKey = computed(
    () => SETUP_TASKS.find((key) => !this.done().has(key)) ?? null,
  );
  protected readonly percent = computed(() =>
    Math.max(3, Math.round((this.doneCount() / this.total) * 100)),
  );
}
