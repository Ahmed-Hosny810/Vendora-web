import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { LucideCheck, LucideTriangleExclamationPoint, LucideX } from '@lucide/angular';

/**
 * Picture of the inventory screen: stock per branch and recent movements.
 * The parent gives it role="img" and an aria-label describing it.
 */
@Component({
  selector: 'app-inventory-screen',
  imports: [TranslocoDirective, LucideCheck, LucideTriangleExclamationPoint, LucideX],
  templateUrl: './inventory-screen.html',
  styleUrl: './inventory-screen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryScreen {
  /** name: key under home.*, status: badge shown in the last column. */
  protected readonly rows = [
    { name: 'products.coffee.name', stock: [18, 16, 8], status: 'ok' },
    { name: 'showcase.inventory.mugRow', stock: [9, 4, 2], status: 'low' },
    { name: 'products.dates.name', stock: [7, 11, 0], status: 'out' },
    { name: 'products.oil.name', stock: [12, 9, 5], status: 'ok' },
    { name: 'showcase.inventory.towelRow', stock: [6, 8, 4], status: 'ok' },
  ] as const;

  protected readonly branches = ['zamalek', 'heliopolis', 'newCairo'] as const;

  protected readonly movements = [
    { qty: '+24', up: true, label: 'received', product: 'products.coffee.name', branch: 'zamalek' },
    { qty: '−2', up: false, label: 'sold', product: 'products.mug.name', branch: 'heliopolis' },
    { qty: '+1', up: true, label: 'returned', product: 'products.towel.name', branch: 'newCairo' },
    { qty: '−1', up: false, label: 'damaged', product: 'products.dates.name', branch: 'zamalek' },
  ] as const;
}
