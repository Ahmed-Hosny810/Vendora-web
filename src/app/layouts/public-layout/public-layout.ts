import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { AppLang, LanguageService } from '../../core/i18n';
import { SiteFooter } from './components/site-footer/site-footer';
import { SiteHeader } from './components/site-header/site-header';

/**
 * Frame for every public page: header on top, the page in the middle
 * (<router-outlet>), footer at the bottom. Pages never include the header
 * or footer themselves; the router puts them inside this layout.
 */
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, TranslocoDirective, SiteHeader, SiteFooter],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {
  private readonly language = inject(LanguageService);

  /** Current language, passed down to the header and footer. */
  protected readonly lang = this.language.lang;

  constructor() {
    // Links like "/#pricing" stop 88px below the top, so the sticky
    // header (72px) doesn't cover the section's title.
    inject(ViewportScroller).setOffset([0, 88]);
  }

  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  /** "Skip to content": move keyboard focus straight to the page. */
  protected skipToContent(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }

  /** Header or footer: the user picked a language. */
  protected changeLanguage(lang: AppLang): void {
    // TODO(you): switch the app language here (LanguageService has a method for it).
    void lang;
  }
}
