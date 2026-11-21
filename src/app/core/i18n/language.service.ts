import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { AppLang, AVAILABLE_LANGS, DEFAULT_LANG, RTL_LANGS } from './transloco.config';

const STORAGE_KEY = 'vendora.lang';

/**
 * Switching language does three things together:
 *  1. Transloco loads the translation file and re-renders the text.
 *  2. <html lang dir> is updated, so CSS (fonts, logical properties) and
 *     screen readers follow.
 *  3. The choice is remembered for the next visit.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  private readonly _lang = signal<AppLang>(DEFAULT_LANG);

  readonly lang = this._lang.asReadonly();
  readonly isRtl = computed(() => RTL_LANGS.includes(this._lang()));
  readonly dir = computed<'rtl' | 'ltr'>(() => (this.isRtl() ? 'rtl' : 'ltr'));

  /**
   * Runs once before the app first renders (see app.config.ts).
   * Waiting for the file here avoids a flash of untranslated keys.
   */
  init(): Promise<unknown> {
    return this.use(this.initialLang());
  }

  /** Switch language, wait until its translations are loaded. */
  async use(lang: AppLang): Promise<void> {
    await firstValueFrom(this.transloco.load(lang));
    this.transloco.setActiveLang(lang);
    this._lang.set(lang);
    this.applyToDocument(lang);
    this.save(lang);
  }

  toggle(): Promise<void> {
    return this.use(this._lang() === 'ar' ? 'en' : 'ar');
  }

  private applyToDocument(lang: AppLang): void {
    const html = this.document.documentElement;
    html.lang = lang;
    html.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  }

  /** Saved choice → browser language → default. */
  private initialLang(): AppLang {
    const saved = this.read();
    if (saved) return saved;

    const browser = this.document.defaultView?.navigator.language.slice(0, 2);
    return this.isSupported(browser) ? browser : DEFAULT_LANG;
  }

  private isSupported(value: string | null | undefined): value is AppLang {
    return !!value && (AVAILABLE_LANGS as readonly string[]).includes(value);
  }

  // localStorage can throw (private mode, blocked storage), so it's wrapped.
  private read(): AppLang | null {
    try {
      const value = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return this.isSupported(value) ? value : null;
    } catch {
      return null;
    }
  }

  private save(lang: AppLang): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Not critical: the language just won't be remembered.
    }
  }
}
