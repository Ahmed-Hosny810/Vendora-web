import { isDevMode } from '@angular/core';
import { TranslocoConfig } from '@jsverse/transloco';

/** Every language the app supports. Add a code here, then add public/i18n/<code>.json. */
export const AVAILABLE_LANGS = ['en', 'ar'] as const;

/** 'en' | 'ar', derived from the list above so the two never drift apart. */
export type AppLang = (typeof AVAILABLE_LANGS)[number];

export const DEFAULT_LANG: AppLang = 'en';

/** Languages written right-to-left. */
export const RTL_LANGS: readonly AppLang[] = ['ar'];

export const translocoConfig: Partial<TranslocoConfig> = {
  availableLangs: [...AVAILABLE_LANGS],
  defaultLang: DEFAULT_LANG,
  // A missing Arabic key shows the English text instead of the raw key.
  fallbackLang: DEFAULT_LANG,
  missingHandler: { useFallbackTranslation: true, logMissingKey: isDevMode(), allowEmpty: false },
  // Re-render translated text when the language changes, without a page reload.
  reRenderOnLangChange: true,
  // In development, warn in the console about missing keys.
  prodMode: !isDevMode(),
};
