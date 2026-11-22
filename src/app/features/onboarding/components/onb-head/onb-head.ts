import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Page heading used by every onboarding step: small mono kicker,
 * big title with a butter highlight that sweeps in, and a lead line.
 *
 * In the title, the highlighted words are wrapped in stars,
 * so translators can move them: "Let's set up your *shop.*"
 *
 * @example
 * <app-onb-head [kicker]="t('details.kicker')" [title]="t('details.title')" [lead]="t('details.lead')" />
 */
@Component({
  selector: 'app-onb-head',
  templateUrl: './onb-head.html',
  styleUrl: './onb-head.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnbHead {
  readonly kicker = input.required<string>();
  readonly title = input.required<string>();
  readonly lead = input('');
  /** For aria-labelledby on the page's form or section. */
  readonly titleId = input<string | null>(null);

  /** "Let's set up your *shop.*" → before / highlight / after. */
  protected readonly parts = computed(() => {
    const [before, highlight = '', after = ''] = this.title().split('*');
    return { before, highlight, after };
  });
}
