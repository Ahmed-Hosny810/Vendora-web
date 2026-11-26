import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleExclamationPoint,
  LucideMonitor,
  LucidePencil,
  LucidePlus,
  LucideRefreshCw,
} from '@lucide/angular';

import { AppShell } from '../../../layouts/app-layout/app-shell';
import { PageHead } from '../../../shared/components/app';
import { injectDrawer, VdButton } from '../../../shared/components/ui';
import { Branch, SaveResult, Terminal, TerminalForm } from '../branches.models';
import { BranchShop } from '../components/branch-shop/branch-shop';
import { TerminalDrawer, TerminalDrawerData } from '../components/terminal-drawer/terminal-drawer';

type Tab = 'details' | 'terminals';

/**
 * One branch (/branches/:id): Details and Terminals tabs.
 * Details shows its fields and the storefront; with no terminals yet,
 * a "Next: add a terminal" card. Terminals lists its counters.
 * Add/Edit terminal opens a side drawer.
 */
@Component({
  selector: 'app-branch-details-page',
  imports: [
    RouterLink,
    TranslocoDirective,
    VdButton,
    PageHead,
    BranchShop,
    LucideCircleExclamationPoint,
    LucideMonitor,
    LucidePencil,
    LucidePlus,
    LucideRefreshCw,
  ],
  templateUrl: './branch-details.page.html',
  styleUrl: './branch-details.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Loads public/i18n/branches/<lang>.json (keys start with "branches.").
  providers: [provideTranslocoScope('branches')],
})
export class BranchDetailsPage {
  private readonly shell = inject(AppShell);
  private readonly injector = inject(Injector);
  private readonly openDrawer = injectDrawer();

  protected readonly branchId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  // ---------- Set by your logic ----------
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly branch = signal<Branch | null>(null);
  protected readonly terminals = signal<Terminal[]>([]);
  /** All branches, for the drawer's Branch select. */
  protected readonly branches = signal<Pick<Branch, 'id' | 'nameEn'>[]>([]);
  /** The terminal added last: its row flashes once. */
  protected readonly newTerminalId = signal<string | null>(null);

  protected readonly tab = signal<Tab>('details');

  protected readonly branchOptions = computed(() => {
    const list = this.branches();
    const current = this.branch();
    // The current branch is always selectable, even before the list loads.
    return current && !list.some((b) => b.id === current.id)
      ? [{ id: current.id, nameEn: current.nameEn }, ...list]
      : list;
  });

  constructor() {
    // Top bar: "Branches and terminals › Nasr City" once the branch is loaded.
    effect(() => this.setTitle(this.branch()?.nameEn ?? null));
    this.load();
  }

  protected load(): void {
    // TODO(you): load this branch (this.branchId), its terminals and the branch list.
    //  - before the request: this.status.set('loading')
    //  - success: this.branch.set(b); this.terminals.set(list); this.branches.set(all);
    //             this.status.set('ready')
    //  - failure: this.status.set('error')
  }

  private setTitle(name: string | null): void {
    this.shell.setPage(name ? { text: name } : { key: 'nav.branches' }, [
      { key: 'nav.branches', link: '/branches' },
      name ? { text: name } : { key: 'nav.branches' },
    ]);
  }

  protected openTerminal(terminal?: Terminal): void {
    const data: TerminalDrawerData = {
      branches: this.branchOptions(),
      branchId: this.branchId,
      terminal,
      save: (value) => this.saveTerminal(value, terminal),
    };
    // The page's injector, so the drawer gets this page's translations.
    const ref = this.openDrawer<TerminalForm, TerminalDrawerData, TerminalDrawer>(TerminalDrawer, {
      data,
      injector: this.injector,
    });
    ref.closed.subscribe((saved) => {
      if (saved) this.tab.set('terminals');
    });
  }

  /** Called by the drawer's Save. Return what happened; the drawer shows it. */
  protected async saveTerminal(value: TerminalForm, existing?: Terminal): Promise<SaveResult> {
    // TODO(you): create (or update `existing`) the terminal with `value`.
    //  - success: add/replace it in this.terminals; this.newTerminalId.set(id);
    //             toast "Terminal saved"; return 'saved'
    //  - device code already used: return 'codeTaken'
    //  - other failure: return 'failed'
    void value;
    void existing;
    return 'failed';
  }
}
