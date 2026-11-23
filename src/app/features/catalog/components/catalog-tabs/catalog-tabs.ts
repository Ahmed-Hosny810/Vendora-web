import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

/**
 * Categories · Units · Tax rates: links between the three catalog setup pages,
 * drawn as underline tabs.
 */
@Component({
  selector: 'app-catalog-tabs',
  imports: [RouterLink, RouterLinkActive, TranslocoDirective],
  template: `
    <nav class="vd-tabs" *transloco="let t; read: 'catalog'" [attr.aria-label]="t('tabs')">
      @for (tab of tabs; track tab.link) {
        <a class="vd-tab" [routerLink]="tab.link" routerLinkActive ariaCurrentWhenActive="page">{{
          t(tab.key + '.tab')
        }}</a>
      }
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }
    a {
      text-decoration: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogTabs {
  protected readonly tabs = [
    { key: 'categories', link: '/categories' },
    { key: 'units', link: '/units' },
    { key: 'taxRates', link: '/tax-rates' },
  ];
}
