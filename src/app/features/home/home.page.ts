import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideTranslocoScope } from '@jsverse/transloco';

import { BenefitsSection } from './components/benefits-section/benefits-section';
import { CtaSection } from './components/cta-section/cta-section';
import { FaqSection } from './components/faq-section/faq-section';
import { FeaturesSection } from './components/features-section/features-section';
import { HeroSection } from './components/hero-section/hero-section';
import { HowItWorksSection } from './components/how-it-works-section/how-it-works-section';
import { PricingSection } from './components/pricing-section/pricing-section';
import { RolesSection } from './components/roles-section/roles-section';
import { ShowcaseSection } from './components/showcase-section/showcase-section';
import { TickerSection } from './components/ticker-section/ticker-section';
import { BillingOption, PricingPlan } from './home.models';

/**
 * The home page. Its template only lists the sections in order;
 * each section is its own component in ./components.
 *
 * Only pricing needs real data (plans from billing). Everything else is
 * fixed text from public/i18n/home/<lang>.json.
 */
@Component({
  selector: 'app-home-page',
  imports: [
    HeroSection,
    TickerSection,
    BenefitsSection,
    ShowcaseSection,
    FeaturesSection,
    HowItWorksSection,
    RolesSection,
    PricingSection,
    FaqSection,
    CtaSection,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/home/<lang>.json, only when this page opens.
  // Its keys start with "home.", e.g. t('home.hero.titleA').
  providers: [provideTranslocoScope('home')],
})
export class HomePage {
  // TODO(you): load these from billing. While loading is true, the section
  // shows grey placeholder cards; with no plans it shows only the note.
  protected readonly plans = signal<PricingPlan[]>([]);
  protected readonly plansLoading = signal(true);
  protected readonly billingOptions = signal<BillingOption[]>([]);
  protected readonly selectedBilling = signal<string | null>(null);

  protected changeBilling(optionId: string): void {
    // TODO(you): load the plans for this billing option.
    this.selectedBilling.set(optionId);
  }

  protected choosePlan(plan: PricingPlan): void {
    // TODO(you): e.g. go to sign-up with this plan selected.
    void plan;
  }
}
