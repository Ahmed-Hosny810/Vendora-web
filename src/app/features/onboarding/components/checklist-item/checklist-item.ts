import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideCheck, LucideDynamicIcon, LucideIcon } from '@lucide/angular';

import { VdButton } from '../../../../shared/components/ui';

/**
 * One row of the welcome checklist: box, icon, title (+ optional tag),
 * one-line explanation and a Start button.
 *
 * @example
 * <app-checklist-item [icon]="LucideStore" title="Create your first branch"
 *   text="…" startLabel="Start" next (start)="open('branch')" />
 */
@Component({
  selector: 'app-checklist-item',
  imports: [VdButton, LucideDynamicIcon, LucideCheck],
  templateUrl: './checklist-item.html',
  styleUrl: './checklist-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.next]': 'next()',
    '[class.done]': 'done()',
  },
})
export class ChecklistItem {
  readonly icon = input.required<LucideIcon>();
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly tag = input('');
  /** 'info' = pine tag (e.g. "Inventory tracking on"), 'optional' = grey tag ("If needed"). */
  readonly tagTone = input<'info' | 'optional'>('info');
  readonly startLabel = input.required<string>();
  readonly doneLabel = input('');
  /** The first task that isn't done: highlighted, with a primary button. */
  readonly next = input(false, { transform: booleanAttribute });
  readonly done = input(false, { transform: booleanAttribute });
  readonly start = output();
}
