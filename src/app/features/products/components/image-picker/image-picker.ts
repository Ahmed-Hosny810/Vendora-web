import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideCircleAlert,
  LucideCircleCheck,
  LucidePlus,
  LucideRefreshCw,
  LucideShoppingBag,
  LucideTrash2,
} from '@lucide/angular';

import { IMAGE_TYPES } from '../../products.models';

/**
 * The product image box: empty (dashed bag), a picked image (with file
 * name, size, Replace and Remove) or "isn't an image" (red).
 * It only previews the file; your page uploads it when the product is saved.
 *
 * @example
 * <app-image-picker [currentUrl]="product.imageUrl" (fileChange)="image.set($event)" />
 *   fileChange: File = a new image picked · null = removed
 */
@Component({
  selector: 'app-image-picker',
  imports: [
    TranslocoDirective,
    LucideCircleAlert,
    LucideCircleCheck,
    LucidePlus,
    LucideRefreshCw,
    LucideShoppingBag,
    LucideTrash2,
  ],
  templateUrl: './image-picker.html',
  styleUrl: './image-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagePicker {
  /** The saved image, when editing a product that has one. */
  readonly currentUrl = input<string | null>(null);
  readonly fileChange = output<File | null>();

  protected readonly accept = IMAGE_TYPES.join(',');

  /** A file picked here (previewed from memory). */
  protected readonly picked = signal<{ url: string; name: string; size: string } | null>(null);
  /** The saved image was removed with Remove. */
  protected readonly removed = signal(false);
  /** Name of a file that wasn't an image. */
  protected readonly badFile = signal<string | null>(null);

  protected readonly imageUrl = computed(
    () => this.picked()?.url ?? (this.removed() ? null : this.currentUrl()),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revoke());
  }

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // so picking the same file again still fires
    if (!file) return;

    if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
      this.badFile.set(file.name);
      return;
    }
    this.revoke();
    this.badFile.set(null);
    this.picked.set({ url: URL.createObjectURL(file), name: file.name, size: this.sizeOf(file) });
    this.fileChange.emit(file);
  }

  protected remove(): void {
    this.revoke();
    this.picked.set(null);
    this.removed.set(true);
    this.fileChange.emit(null);
  }

  /** "240 KB" / "1.2 MB" */
  private sizeOf(file: File): string {
    const kb = file.size / 1024;
    return kb < 1024 ? `${Math.max(1, Math.round(kb))} KB` : `${(kb / 1024).toFixed(1)} MB`;
  }

  private revoke(): void {
    const url = this.picked()?.url;
    if (url) URL.revokeObjectURL(url);
  }
}
