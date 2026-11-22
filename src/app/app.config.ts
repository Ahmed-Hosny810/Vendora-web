import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideLucideConfig } from '@lucide/angular';

import { routes } from './app.routes';
import { provideI18n } from './core/i18n';
import { provideDialogDefaults } from './shared/components/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideI18n(),
    // Default look of every icon, matching the design system.
    provideLucideConfig({ size: 20, strokeWidth: 1.75 }),
    // Our look for every CDK Dialog (backdrop, panel).
    provideDialogDefaults(),
  ],
};
