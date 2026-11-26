import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideArrowRight, LucideGlobe, LucideMenu, LucideX } from '@lucide/angular';

import { AppLang } from '../../../../core/i18n';
import { VdButton, VdWordmark } from '../../../../shared/components/ui';

/** One link in the header. `fragment` is the id of a section on the home page. */
interface NavLink {
  label: string;
  fragment: string;
}

/**
 * Header of the public website (home, pricing, sign in…).
 *
 * Presentational: it shows the current language and tells the parent when
 * the user picks the other one. It does NOT switch the language itself.
 *
 * @example
 * <app-site-header [lang]="lang()" (languageChange)="changeLanguage($event)" />
 */
@Component({
  selector: 'app-site-header',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    VdWordmark,
    LucideGlobe,
    LucideMenu,
    LucideX,
    LucideArrowRight,
  ],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Escape closes the mobile menu.
    '(document:keydown.escape)': 'closeMenu(true)',
  },
})
export class SiteHeader {
  /** The language the page is shown in now. */
  readonly lang = input.required<AppLang>();

  /** Emits the language the user picked. The parent does the switching. */
  readonly languageChange = output<AppLang>();

  protected readonly links: readonly NavLink[] = [
    { label: 'site.nav.features', fragment: 'features' },
    { label: 'site.nav.how', fragment: 'how-it-works' },
    { label: 'site.nav.pricing', fragment: 'pricing' },
    { label: 'site.nav.faq', fragment: 'faq' },
  ];

  /** The button always offers the language you are NOT using. */
  protected readonly otherLang = computed<AppLang>(() => (this.lang() === 'ar' ? 'en' : 'ar'));

  /** Mobile menu: open or closed. This is UI state only. */
  protected readonly menuOpen = signal(false);

  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** `returnFocus`: after Escape, put the keyboard back on the menu button. */
  protected closeMenu(returnFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (returnFocus) this.menuButton().nativeElement.focus();
  }

  protected pickLanguage(): void {
    this.closeMenu();
    this.languageChange.emit(this.otherLang());
  }
}
