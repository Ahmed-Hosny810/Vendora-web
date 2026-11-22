import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideChevronRight, LucideDynamicIcon } from '@lucide/angular';

import { LanguageService } from '../../../../core/i18n';
import { SectionHeading } from '../../../../shared/components/marketing/section-heading/section-heading';
import { SHOWCASE_TABS, ShowcaseTab } from '../../home.data';
import { InventoryScreen } from './screens/inventory-screen/inventory-screen';
import { PosScreen } from './screens/pos-screen/pos-screen';
import { ReportsScreen } from './screens/reports-screen/reports-screen';
import { TeamScreen } from './screens/team-screen/team-screen';
import { ShowcasePanel } from './showcase-panel/showcase-panel';

/**
 * "See it work": four tabs, each showing a picture of one product area.
 *
 * Tabs follow the standard keyboard pattern: Tab enters the tab list,
 * arrow keys move between tabs, Home/End jump to the first/last.
 */
@Component({
  selector: 'app-showcase-section',
  imports: [
    TranslocoDirective,
    LucideDynamicIcon,
    LucideChevronRight,
    SectionHeading,
    ShowcasePanel,
    PosScreen,
    InventoryScreen,
    ReportsScreen,
    TeamScreen,
  ],
  templateUrl: './showcase-section.html',
  styleUrl: './showcase-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseSection {
  private readonly language = inject(LanguageService);

  protected readonly tabs = SHOWCASE_TABS;

  /** UI state: which tab is open. */
  protected readonly selected = signal<ShowcaseTab>('pos');
  protected readonly selectedIndex = computed(() =>
    this.tabs.findIndex((tab) => tab.key === this.selected()),
  );

  /** Phones: the "more tabs" arrow hides once the user scrolls the tabs. */
  protected readonly scrolled = signal(false);

  private readonly tabList = viewChild.required<ElementRef<HTMLElement>>('tabList');

  protected select(tab: ShowcaseTab): void {
    this.selected.set(tab);
  }

  /** Arrow keys, Home and End move between tabs. */
  protected onKeydown(event: KeyboardEvent): void {
    const count = this.tabs.length;
    const current = this.selectedIndex();
    // In Arabic the tabs run right to left, so the arrows swap meaning.
    const forward = this.language.isRtl() ? 'ArrowLeft' : 'ArrowRight';
    const back = this.language.isRtl() ? 'ArrowRight' : 'ArrowLeft';

    let next: number;
    if (event.key === forward) next = (current + 1) % count;
    else if (event.key === back) next = (current - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;

    event.preventDefault();
    this.selected.set(this.tabs[next].key);
    this.focusTab(next);
  }

  protected onTabsScroll(): void {
    if (Math.abs(this.tabList().nativeElement.scrollLeft) > 12) this.scrolled.set(true);
  }

  /** Phones: the arrow button scrolls the tabs toward the end. */
  protected showMoreTabs(): void {
    const direction = this.language.isRtl() ? -1 : 1;
    this.tabList().nativeElement.scrollBy({ left: direction * 170, behavior: 'smooth' });
  }

  private focusTab(index: number): void {
    const tab = this.tabList().nativeElement.querySelectorAll<HTMLElement>('[role="tab"]')[index];
    tab?.focus();
    tab?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
}
