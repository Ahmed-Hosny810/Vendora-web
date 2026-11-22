import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import { AppLang, AVAILABLE_LANGS } from '../../../../core/i18n';
import { VdWordmark } from '../../../../shared/components/ui';
import { SITE_LINKS } from '../../site-links';

/**
 * A footer link is one of two kinds:
 *  - inside the app: `route` (+ optional `fragment` for a home page section)
 *  - outside the app: `href` (hidden while it's null)
 */
interface FooterLink {
  label: string;
  route?: string;
  fragment?: string;
  href?: string | null;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

/**
 * Footer of the public website. Presentational, like the header:
 * the language switch only tells the parent which language was picked.
 *
 * @example
 * <app-site-footer [lang]="lang()" (languageChange)="changeLanguage($event)" />
 */
@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, TranslocoDirective, VdWordmark],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  readonly lang = input.required<AppLang>();
  readonly languageChange = output<AppLang>();

  protected readonly languages = AVAILABLE_LANGS;
  protected readonly year = new Date().getFullYear();

  private readonly allColumns: FooterColumn[] = [
    {
      title: 'site.footer.product',
      links: [
        { label: 'site.nav.features', route: '/', fragment: 'features' },
        { label: 'site.nav.how', route: '/', fragment: 'how-it-works' },
        { label: 'site.nav.pricing', route: '/', fragment: 'pricing' },
        { label: 'site.nav.faq', route: '/', fragment: 'faq' },
      ],
    },
    {
      title: 'site.footer.account',
      links: [
        { label: 'site.signIn', route: '/sign-in' },
        { label: 'site.getStarted', route: '/sign-up' },
      ],
    },
    {
      title: 'site.footer.support',
      links: [
        { label: 'site.footer.help', href: SITE_LINKS.helpCenter },
        { label: 'site.footer.contact', href: SITE_LINKS.contactSupport },
      ],
    },
    {
      title: 'site.footer.legal',
      links: [
        { label: 'site.footer.terms', href: SITE_LINKS.terms },
        { label: 'site.footer.privacy', href: SITE_LINKS.privacy },
      ],
    },
  ];

  /** Drop outside links that have no URL yet, then drop empty columns. */
  protected readonly columns = this.allColumns
    .map((column) => ({
      ...column,
      links: column.links.filter((link) => link.route || link.href),
    }))
    .filter((column) => column.links.length > 0);
}
