import { Injectable, signal } from '@angular/core';

/**
 * A label in the top bar: a translation key under "shell." (e.g. 'nav.branches')
 * or plain text (e.g. a branch's name). `link` makes it a breadcrumb link.
 */
export interface ShellLabel {
  key?: string;
  text?: string;
  link?: string;
}

/**
 * Lets each page set the top bar: its title, and the breadcrumbs above it.
 * Provided by AppLayout, so all its pages share one copy.
 *
 * @example
 * // a top-level page:
 * inject(AppShell).setTitle('overview');                    ← key under shell.nav
 * // a page deeper down:
 * inject(AppShell).setPage({ key: 'pages.addBranch' }, [
 *   { key: 'nav.branches', link: '/branches' },
 *   { key: 'pages.addBranch' },
 * ]);
 */
@Injectable()
export class AppShell {
  readonly title = signal<ShellLabel>({ key: 'nav.overview' });
  readonly crumbs = signal<ShellLabel[]>([]);
  /** Phones: the sidebar is open as a drawer. */
  readonly navOpen = signal(false);

  /** Title from the sidebar names (key under shell.nav), no breadcrumbs. */
  setTitle(navKey: string): void {
    this.setPage({ key: 'nav.' + navKey });
  }

  setPage(title: ShellLabel, crumbs: ShellLabel[] = []): void {
    this.title.set(title);
    this.crumbs.set(crumbs);
  }
}
