import { LiveAnnouncer } from '@angular/cdk/a11y';
import { inject, Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
  /** Second, smaller line. */
  body?: string;
  /** Label of one button inside the toast, e.g. "Undo". */
  action?: string;
  /** Runs when the action button is pressed (the toast then closes). */
  onAction?: () => void;
  /** Milliseconds before it hides. 0 = stays until closed. Default 5000; errors stay. */
  duration?: number;
}

export interface Toast extends ToastOptions {
  readonly id: number;
  readonly type: ToastType;
  readonly title: string;
  /** True for a moment before removal, so it can fade out. */
  readonly leaving: boolean;
}

const MAX_VISIBLE = 3;
const LEAVE_MS = 200;

/**
 * Short messages in the corner: "Product saved".
 * Pass text that is already translated. <vd-toaster /> (in app.ts) shows them.
 *
 * @example
 * private readonly toast = inject(ToastService);
 * this.toast.success(t('product.saved'));
 * this.toast.error(t('payment.failed'), { action: t('common.retry'), onAction: () => this.pay() });
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly announcer = inject(LiveAnnouncer);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  private readonly _toasts = signal<readonly Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(title: string, options?: ToastOptions): number {
    return this.show('success', title, options);
  }

  info(title: string, options?: ToastOptions): number {
    return this.show('info', title, options);
  }

  warning(title: string, options?: ToastOptions): number {
    return this.show('warning', title, options);
  }

  error(title: string, options?: ToastOptions): number {
    return this.show('error', title, options);
  }

  show(type: ToastType, title: string, options: ToastOptions = {}): number {
    const id = this.nextId++;
    const toast: Toast = { ...options, id, type, title, leaving: false };

    // Keep at most 3: the oldest goes first.
    const list = [...this._toasts(), toast];
    list.slice(0, -MAX_VISIBLE).forEach((old) => this.clearTimer(old.id));
    this._toasts.set(list.slice(-MAX_VISIBLE));

    // Screen readers read it aloud; errors interrupt, others wait their turn.
    const spoken = [title, options.body].filter(Boolean).join('. ');
    this.announcer.announce(spoken, type === 'error' ? 'assertive' : 'polite');

    const duration = options.duration ?? (type === 'error' ? 0 : 5000);
    if (duration > 0) {
      this.timers.set(
        id,
        setTimeout(() => this.dismiss(id), duration),
      );
    }
    return id;
  }

  dismiss(id: number): void {
    this.clearTimer(id);
    this._toasts.update((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => this._toasts.update((list) => list.filter((t) => t.id !== id)), LEAVE_MS);
  }

  /** Runs the toast's action, then closes it. */
  runAction(toast: Toast): void {
    toast.onAction?.();
    this.dismiss(toast.id);
  }

  private clearTimer(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }
}
