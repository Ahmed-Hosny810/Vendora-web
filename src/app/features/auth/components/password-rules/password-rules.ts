import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideCircleExclamationPoint, LucideX } from '@lucide/angular';

import { PasswordChecks } from '../../auth.models';

/**
 * Red box listing the password rules, each with ✓ or ✗.
 * The design shows it only after a submit, when the password fails a rule.
 *
 * @example
 * <app-password-rules id="pw-rules" [checks]="checks()" />
 */
@Component({
  selector: 'app-password-rules',
  imports: [TranslocoDirective, LucideCheck, LucideX, LucideCircleExclamationPoint],
  templateUrl: './password-rules.html',
  styleUrl: './password-rules.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'alert' },
})
export class PasswordRules {
  readonly checks = input.required<PasswordChecks>();

  protected readonly rules = ['length', 'upper', 'lower', 'number'] as const;
}
