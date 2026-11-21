import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { LanguageService } from './core/i18n';

// TEMPORARY: a small page to check tokens, fonts and translations.
// In the next step app.html becomes <router-outlet /> and this goes away.
@Component({
  selector: 'app-root',
  imports: [TranslocoDirective],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly language = inject(LanguageService);

  protected readonly swatches = [
    'paper-50',
    'paper-100',
    'line',
    'ink-900',
    'pine-700',
    'pine-300',
    'butter-300',
    'butter-500',
    'success-bg',
    'warning-bg',
    'danger-bg',
    'info-bg',
  ];

  protected readonly typeStyles = [
    'display-md',
    'heading-lg',
    'heading-md',
    'heading-sm',
    'lead',
    'body',
    'label',
    'caption',
    'overline',
    'figure-lg',
  ];
}
