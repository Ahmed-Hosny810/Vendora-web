import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';

import { LanguageService } from './language.service';
import { translocoConfig } from './transloco.config';
import { TranslocoHttpLoader } from './transloco-loader';

/**
 * Everything i18n needs, as one provider for app.config.ts.
 * Keeps app.config.ts short and keeps i18n details in this folder.
 */
export function provideI18n(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideTransloco({ config: translocoConfig, loader: TranslocoHttpLoader }),
    provideAppInitializer(() => inject(LanguageService).init()),
  ]);
}
