import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

/**
 * A sample receipt with a zig-zag top and bottom, showing how this branch's
 * details print. The receipt header lines are highlighted with a dashed box.
 *
 * @example
 * <app-receipt-preview businessName="Nour Boutique" address="14 Abbas El Akkad St. · Cairo"
 *   header="Thank you for shopping with us!" phone="02 2345 6789" />
 */
@Component({
  selector: 'app-receipt-preview',
  imports: [UpperCasePipe, TranslocoDirective],
  templateUrl: './receipt-preview.html',
  styleUrl: './receipt-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptPreview {
  readonly businessName = input('');
  readonly address = input('');
  readonly header = input('');
  readonly phone = input('');

  protected readonly headerLines = computed(() =>
    this.header()
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  );
}
