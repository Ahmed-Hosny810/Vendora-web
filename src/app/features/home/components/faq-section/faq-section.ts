import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucidePlus } from '@lucide/angular';

import { SITE_LINKS } from '../../../../layouts/public-layout/site-links';
import { SectionHeading } from '../../../../shared/components/marketing/section-heading/section-heading';
import { FAQ_KEYS } from '../../home.data';

/**
 * Questions and answers. Each one is a native <details> element:
 * the browser opens/closes it and tells screen readers, no code needed.
 */
@Component({
  selector: 'app-faq-section',
  imports: [TranslocoDirective, SectionHeading, LucidePlus],
  templateUrl: './faq-section.html',
  styleUrl: './faq-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqSection {
  protected readonly questions = FAQ_KEYS;
  /** null until the support page exists; the link is hidden until then. */
  protected readonly contactUrl = SITE_LINKS.contactSupport;
}
