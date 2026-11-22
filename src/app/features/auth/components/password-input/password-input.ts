import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

/**
 * A password box with an eye button that shows/hides what you typed.
 * Connects to a Signal Forms field, like an <input [formField]>.
 *
 * @example
 * <app-password-input
 *   inputId="password"
 *   autocomplete="current-password"
 *   [field]="loginForm.password"
 *   [invalid]="!!passwordError()"
 *   [describedBy]="passwordError() ? 'password-error' : null"
 * />
 */
@Component({
  selector: 'app-password-input',
  imports: [FormField, TranslocoDirective, LucideEye, LucideEyeOff],
  templateUrl: './password-input.html',
  styleUrl: './password-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordInput {
  readonly field = input.required<FieldTree<string>>();
  /** The <input>'s id, so a <label for="…"> can point to it. */
  readonly inputId = input.required<string>();
  /** 'current-password' to sign in, 'new-password' to register. */
  readonly autocomplete = input<'current-password' | 'new-password'>('current-password');
  readonly invalid = input(false);
  /** Id(s) of the error/help text under the field. */
  readonly describedBy = input<string | null>(null);
  /** 'lg' = normal big box; 'receipt' = the taller box on the register receipt. */
  readonly size = input<'md' | 'lg' | 'receipt'>('lg');

  /** UI state: is the password shown as text? */
  protected readonly visible = signal(false);

  protected toggle(): void {
    this.visible.update((visible) => !visible);
  }
}
